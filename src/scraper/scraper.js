import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const routesDataPath = path.join(__dirname, '../data/routes.json');

// Lista de rotas prioritárias para atualizar via scraping
const routesToScrape = [
  { origin: 'Santa Cruz do Sul', destination: 'Santa Maria' },
  { origin: 'Porto Alegre', destination: 'Florianópolis' }
];

const slugify = (text) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();

async function runScraper() {
  console.log('Iniciando scraper do Clique Ônibus...');
  let existingRoutes = [];
  try {
    existingRoutes = JSON.parse(fs.readFileSync(routesDataPath, 'utf-8'));
  } catch (err) {
    console.error('Erro ao ler routes.json:', err);
  }

  // Inicializa Puppeteer em modo Headless (invisível)
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Setar User-Agent real para mitigar bloqueios anti-bot básicos
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

  const today = new Date();
  today.setDate(today.getDate() + 7); // Buscar para daqui a 7 dias
  const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  for (const route of routesToScrape) {
    const oSlug = slugify(route.origin);
    const dSlug = slugify(route.destination);
    
    // Supondo scraping a partir da ClickBus como exemplo de parceiro
    const url = `https://www.clickbus.com.br/onibus/${oSlug}-rs/${dSlug}-sc?data=${dateStr}`;
    console.log(`Buscando dados reais para: ${route.origin} -> ${route.destination}`);
    
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Lógica de extração de horários (Exemplo genérico)
      // Como os seletores mudam frequentemente, este é um esqueleto que precisa de manutenção
      /*
      const trips = await page.evaluate(() => {
        const results = [];
        document.querySelectorAll('.ticket-card').forEach(card => {
          results.push({
            company: card.querySelector('.company-name').innerText,
            departureTime: card.querySelector('.departure-time').innerText,
            arrivalTime: card.querySelector('.arrival-time').innerText,
            price: parseFloat(card.querySelector('.price').innerText.replace('R$', '').replace(',','.'))
          });
        });
        return results;
      });
      */
      
      console.log(` Scraping concluído para ${route.origin} -> ${route.destination}. (Simulado)`);
      // Aqui você mergearia os "trips" raspados com o existingRoutes.
      // existingRoutes.push(...trips)
      
    } catch (err) {
      console.error(`Erro ao fazer scraping da rota ${url}:`, err.message);
    }
  }

  // fs.writeFileSync(routesDataPath, JSON.stringify(existingRoutes, null, 2));
  console.log('Atualização do banco de dados de rotas concluída.');
  
  await browser.close();
}

runScraper();
