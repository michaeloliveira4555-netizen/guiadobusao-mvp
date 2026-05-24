import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import searchController from './src/controllers/searchController.js'

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
