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
  },

  getSitemap(req, res) {
    try {
      const routes = RouteModel.getAllRoutes()
      const combinations = new Set()
      
      // Gera rotas apenas para destinos que realmente têm conexões disponíveis.
      // Para o MVP de SEO, basta pegar origem e destino direto de cada segmento existente.
      routes.forEach(route => {
        const oSlug = route.origin.toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
        const dSlug = route.destination.toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
        combinations.add(`/rota/${oSlug}/${dSlug}`);
      })

      const dateStr = new Date().toISOString().split('T')[0]
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
      
      // Home page
      xml += `  <url>\n    <loc>https://cliqueonibus.com.br/</loc>\n    <lastmod>${dateStr}</lastmod>\n    <priority>1.0</priority>\n  </url>\n`

      // Route pages
      combinations.forEach(url => {
        xml += `  <url>\n    <loc>https://cliqueonibus.com.br${url}</loc>\n    <lastmod>${dateStr}</lastmod>\n    <priority>0.8</priority>\n  </url>\n`
      })

      xml += `</urlset>`

      res.header('Content-Type', 'application/xml')
      return res.send(xml)
    } catch (err) {
      console.error('Erro ao gerar sitemap:', err)
      return res.status(500).send('Erro ao gerar sitemap')
    }
  }
}

export default searchController
