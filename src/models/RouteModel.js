import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const routesDataPath = path.join(__dirname, '../data/routes.json')

const MIN_CONNECTION_MINUTES = 30
const MAX_CONNECTION_MINUTES = 720 // Aumentado para 12 horas para permitir layovers noturnos

function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

function isOvernightRoute(route) {
  return timeToMinutes(route.arrivalTime) <= timeToMinutes(route.departureTime)
}

function isValidConnection(arrivalTime, departureTime) {
  const arr = timeToMinutes(arrivalTime)
  const dep = timeToMinutes(departureTime)
  let wait = dep - arr
  if (wait < 0) {
    wait += 1440
  }
  return wait >= MIN_CONNECTION_MINUTES && wait <= MAX_CONNECTION_MINUTES
}

function buildItinerary(segments) {
  const first = segments[0]
  const last = segments[segments.length - 1]
  const stops = segments.length - 1

  let totalPrice = 0
  let totalTimeMinutes = 0
  const connections = []

  segments.forEach((seg, i) => {
    totalPrice += seg.price
    let travelTime = timeToMinutes(seg.arrivalTime) - timeToMinutes(seg.departureTime)
    if (travelTime < 0) {
      travelTime += 1440
    }
    totalTimeMinutes += travelTime

    if (i < segments.length - 1) {
      const nextSeg = segments[i + 1]
      let waitTime = timeToMinutes(nextSeg.departureTime) - timeToMinutes(seg.arrivalTime)
      if (waitTime < 0) {
        waitTime += 1440
      }
      totalTimeMinutes += waitTime
      connections.push({
        city: seg.destination,
        arrivalTime: seg.arrivalTime,
        departureTime: nextSeg.departureTime,
        waitTimeMinutes: waitTime
      })
    }
  })

  return {
    type: stops === 0 ? 'direct' : 'connection',
    stops,
    totalPrice: Math.round(totalPrice * 100) / 100,
    departureTime: first.departureTime,
    arrivalTime: last.arrivalTime,
    totalTimeMinutes,
    connections,
    segments
  }
}

class RouteModel {
  static _cachedRoutes = null
  static _cachedCities = null

  static getAllRoutes() {
    if (!this._cachedRoutes) {
      const rawData = fs.readFileSync(routesDataPath, 'utf-8')
      this._cachedRoutes = JSON.parse(rawData)
    }
    return this._cachedRoutes
  }

  static getAllCities() {
    if (!this._cachedCities) {
      const routes = this.getAllRoutes()
      const citySet = new Set()
      routes.forEach(r => {
        citySet.add(r.origin)
        citySet.add(r.destination)
      })
      this._cachedCities = [...citySet].sort()
    }
    return this._cachedCities
  }

  static reloadData() {
    this._cachedRoutes = null
    this._cachedCities = null
  }

  static findItineraries(origin, destination) {
    const allRoutes = this.getAllRoutes()
    const originLower = origin.toLowerCase()
    const destLower = destination.toLowerCase()
    const itineraries = []

    // Indexar rotas por origem para performance
    const routesByOrigin = {}
    allRoutes.forEach(route => {
      const key = route.origin.toLowerCase()
      if (!routesByOrigin[key]) routesByOrigin[key] = []
      routesByOrigin[key].push(route)
    })

    const fromOrigin = routesByOrigin[originLower] || []

    const MAX_STOPS = 4 // Permite até 4 conexões (5 trechos)
    const queue = []

    // 1. Inicializa a fila com rotas diretas saindo da origem
    fromOrigin.forEach(route => {
      queue.push({
        segments: [route],
        currentCity: route.destination.toLowerCase(),
        lastArrival: route.arrivalTime,
        stops: 0
      })
    })

    // 2. Busca em Largura (BFS) para encontrar conexões
    while (queue.length > 0) {
      const current = queue.shift()

      // Se chegou no destino, salva o itinerário e não continua buscando a partir daqui
      if (current.currentCity === destLower) {
        itineraries.push(buildItinerary(current.segments))
        continue
      }

      // Limite de conexões
      if (current.stops >= MAX_STOPS) continue

      const nextRoutes = routesByOrigin[current.currentCity] || []
      
      nextRoutes.forEach(nextLeg => {
        const nextDest = nextLeg.destination.toLowerCase()
        
        // Evita ciclos (voltar para uma cidade já visitada ou para a origem)
        if (nextDest === originLower) return
        if (current.segments.some(s => s.origin.toLowerCase() === nextDest)) return

        // Valida se o tempo de conexão é válido (entre 30 min e 12h)
        if (isValidConnection(current.lastArrival, nextLeg.departureTime)) {
          queue.push({
            segments: [...current.segments, nextLeg],
            currentCity: nextDest,
            lastArrival: nextLeg.arrivalTime,
            stops: current.stops + 1
          })
        }
      })
    }

    // Ordenar: menor tempo total primeiro
    itineraries.sort((a, b) => {
      if (a.stops !== b.stops) return a.stops - b.stops
      return a.totalTimeMinutes - b.totalTimeMinutes
    })

    // Limitar a 15 melhores resultados para não sobrecarregar
    return itineraries.slice(0, 15)
  }
}

export default RouteModel
