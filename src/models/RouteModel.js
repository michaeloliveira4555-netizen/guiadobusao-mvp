import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const routesDataPath = path.join(__dirname, '../data/routes.json')

const MIN_CONNECTION_MINUTES = 30
const MAX_CONNECTION_MINUTES = 240

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

    // === 1. Busca Direta (Sem conexões) ===
    fromOrigin.forEach(route => {
      if (route.destination.toLowerCase() === destLower) {
        itineraries.push(buildItinerary([route]))
      }
    })

    // === 2. Busca com 1 Conexão ===
    fromOrigin.forEach(leg1 => {
      const midCity = leg1.destination.toLowerCase()
      if (midCity === destLower || midCity === originLower) return

      const fromMid = routesByOrigin[midCity] || []
      fromMid.forEach(leg2 => {
        if (leg2.destination.toLowerCase() !== destLower) return
        if (!isValidConnection(leg1.arrivalTime, leg2.departureTime)) return

        itineraries.push(buildItinerary([leg1, leg2]))
      })
    })

    // === 3. Busca com 2 Conexões ===
    fromOrigin.forEach(leg1 => {
      const mid1 = leg1.destination.toLowerCase()
      if (mid1 === destLower || mid1 === originLower) return

      const fromMid1 = routesByOrigin[mid1] || []
      fromMid1.forEach(leg2 => {
        const mid2 = leg2.destination.toLowerCase()
        if (mid2 === destLower) return // isso seria 1 conexão, já coberto
        if (mid2 === originLower || mid2 === mid1) return
        if (!isValidConnection(leg1.arrivalTime, leg2.departureTime)) return

        const fromMid2 = routesByOrigin[mid2] || []
        fromMid2.forEach(leg3 => {
          if (leg3.destination.toLowerCase() !== destLower) return
          if (!isValidConnection(leg2.arrivalTime, leg3.departureTime)) return

          itineraries.push(buildItinerary([leg1, leg2, leg3]))
        })
      })
    })

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
