import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import searchController from './src/controllers/searchController.js'
import RouteModel from './src/models/RouteModel.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, 'public')))

// Rotas da API
app.get('/api/cities', searchController.getCities)
app.get('/api/search', searchController.searchRoutes)
app.get('/api/buy-link', searchController.getBuyLink)
app.get('/sitemap.xml', searchController.getSitemap)

// --- Autenticação Admin ---
const requireAdmin = (req, res, next) => {
  const pwd = req.headers['authorization']
  // Em dev, se não tiver ADMIN_PASSWORD definida, aceita '123' provisoriamente
  const expectedPwd = process.env.ADMIN_PASSWORD || '123'
  if (pwd === expectedPwd) {
    next()
  } else {
    res.status(401).json({ error: 'Não autorizado' })
  }
}

const routesPath = path.join(__dirname, 'src', 'data', 'routes.json')

// --- Endpoints do Admin ---
app.get('/api/admin/routes', requireAdmin, (req, res) => {
  res.json(RouteModel.getAllRoutes())
})

app.post('/api/admin/routes', requireAdmin, (req, res) => {
  const newRoute = req.body
  const currentRoutes = RouteModel.getAllRoutes()
  currentRoutes.push(newRoute)
  fs.writeFileSync(routesPath, JSON.stringify(currentRoutes, null, 2))
  RouteModel.reloadData()
  res.json({ success: true })
})

app.delete('/api/admin/routes/:index', requireAdmin, (req, res) => {
  const index = parseInt(req.params.index)
  const currentRoutes = RouteModel.getAllRoutes()
  if (index >= 0 && index < currentRoutes.length) {
    currentRoutes.splice(index, 1)
    fs.writeFileSync(routesPath, JSON.stringify(currentRoutes, null, 2))
    RouteModel.reloadData()
    res.json({ success: true })
  } else {
    res.status(400).json({ error: 'Índice inválido' })
  }
})

// Rota SEO para links dinâmicos
app.get('/rota/:origem/:destino', (req, res) => {
  const { origem, destino } = req.params
  
  const formatName = (slug) => {
    if (!slug) return ''
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
  
  const origemFormatada = formatName(origem)
  const destinoFormatada = formatName(destino)
  
  const filePath = path.join(__dirname, 'public', 'route.html')
  
  if (!fs.existsSync(filePath)) {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'))
  }
  
  try {
    let html = fs.readFileSync(filePath, 'utf8')
    html = html
      .replace(/{{ORIGEM}}/g, origemFormatada)
      .replace(/{{DESTINO}}/g, destinoFormatada)
      .replace(/{{ORIGEM_SLUG}}/g, origem)
      .replace(/{{DESTINO_SLUG}}/g, destino)
    
    res.send(html)
  } catch (err) {
    console.error('Erro ao ler ou processar route.html:', err)
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
  }
})

// Rota principal (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
