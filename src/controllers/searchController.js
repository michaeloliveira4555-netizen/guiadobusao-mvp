import RouteModel from '../models/RouteModel.js'
import { getBuyLink } from '../config/buyLinks.js'

const searchController = {
  searchRoutes(req, res) {
    const { origin, destination, date } = req.query

    if (!origin || !destination) {
      return res.status(400).json({
        error: 'Os campos "origin" e "destination" são obrigatórios.'
      })
    }

    if (origin.toLowerCase() === destination.toLowerCase()) {
      return res.status(400).json({
        error: 'A origem e o destino não podem ser iguais.'
      })
    }

    try {
      const itineraries = RouteModel.findItineraries(origin, destination)

      // Injetar buyUrl em cada segmento do itinerário
      itineraries.forEach(itin => {
        itin.segments.forEach(seg => {
          seg.buyUrl = getBuyLink(seg.companySlug, seg.origin, seg.destination, date)
        })
      })

      return res.json({
        origin,
        destination,
        totalResults: itineraries.length,
        itineraries
      })
    } catch (err) {
      console.error('Erro ao buscar rotas:', err)
      return res.status(500).json({
        error: 'Erro interno ao processar a busca de rotas.'
      })
    }
  },

  getCities(req, res) {
    try {
      const cities = RouteModel.getAllCities()
      return res.json({ cities })
    } catch (err) {
      console.error('Erro ao buscar cidades:', err)
      return res.status(500).json({
        error: 'Erro interno ao carregar as cidades.'
      })
    }
  },

  getBuyLink(req, res) {
    const { company, origin, destination, date } = req.query

    if (!company || !origin || !destination) {
      return res.status(400).json({
        error: 'Os campos "company", "origin" e "destination" são obrigatórios.'
      })
    }

    try {
      const url = getBuyLink(company, origin, destination, date)
      return res.json({ url })
    } catch (err) {
      console.error('Erro ao gerar link de compra:', err)
      return res.status(500).json({
        error: 'Erro interno ao gerar o link de compra.'
      })
    }
  }
}

export default searchController
