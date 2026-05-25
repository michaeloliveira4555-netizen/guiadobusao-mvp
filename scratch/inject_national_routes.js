import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const routesPath = path.join(__dirname, '../src/data/routes.json');

const newRoutes = [
  // --- HUB SÃO PAULO ---
  { origin: "São Paulo", destination: "Rio de Janeiro", company: "Auto Viação 1001", departureTime: "08:00", arrivalTime: "14:20", price: 150.00 },
  { origin: "São Paulo", destination: "Rio de Janeiro", company: "Cometa", departureTime: "23:30", arrivalTime: "05:40", price: 130.00 },
  
  { origin: "São Paulo", destination: "Curitiba", company: "Cometa", departureTime: "09:00", arrivalTime: "15:30", price: 120.00 },
  { origin: "São Paulo", destination: "Curitiba", company: "Penha", departureTime: "22:30", arrivalTime: "05:00", price: 140.00 },
  
  { origin: "São Paulo", destination: "Belo Horizonte", company: "Cometa", departureTime: "10:30", arrivalTime: "19:30", price: 150.00 },
  { origin: "São Paulo", destination: "Belo Horizonte", company: "Gontijo", departureTime: "21:45", arrivalTime: "06:15", price: 145.00 },
  
  { origin: "São Paulo", destination: "Florianópolis", company: "Catarinense", departureTime: "18:30", arrivalTime: "06:00", price: 250.00 },
  { origin: "São Paulo", destination: "Florianópolis", company: "Catarinense", departureTime: "20:00", arrivalTime: "07:30", price: 260.00 },
  
  { origin: "São Paulo", destination: "Porto Alegre", company: "Penha", departureTime: "17:00", arrivalTime: "11:00", price: 380.00 },
  { origin: "São Paulo", destination: "Porto Alegre", company: "Penha", departureTime: "20:30", arrivalTime: "14:00", price: 400.00 },
  
  { origin: "São Paulo", destination: "Campinas", company: "Cometa", departureTime: "07:00", arrivalTime: "08:30", price: 50.00 },
  { origin: "São Paulo", destination: "Campinas", company: "Cometa", departureTime: "18:00", arrivalTime: "19:30", price: 50.00 },
  
  { origin: "São Paulo", destination: "Ribeirão Preto", company: "Cometa", departureTime: "08:00", arrivalTime: "12:30", price: 130.00 },
  { origin: "São Paulo", destination: "Ribeirão Preto", company: "Cometa", departureTime: "14:00", arrivalTime: "18:30", price: 130.00 },
  
  { origin: "São Paulo", destination: "Santos", company: "Cometa", departureTime: "09:00", arrivalTime: "10:15", price: 45.00 },
  { origin: "São Paulo", destination: "Santos", company: "Cometa", departureTime: "15:00", arrivalTime: "16:15", price: 45.00 },
  
  { origin: "São Paulo", destination: "Vitória", company: "Águia Branca", departureTime: "16:30", arrivalTime: "06:30", price: 300.00 },
  { origin: "São Paulo", destination: "Vitória", company: "Águia Branca", departureTime: "19:00", arrivalTime: "09:00", price: 310.00 },
  
  { origin: "São Paulo", destination: "Foz do Iguaçu", company: "Catarinense", departureTime: "17:30", arrivalTime: "10:00", price: 350.00 },
  { origin: "São Paulo", destination: "Foz do Iguaçu", company: "Catarinense", departureTime: "19:00", arrivalTime: "11:30", price: 380.00 },
  
  { origin: "São Paulo", destination: "Joinville", company: "Catarinense", departureTime: "21:00", arrivalTime: "05:00", price: 180.00 },
  { origin: "São Paulo", destination: "Joinville", company: "Penha", departureTime: "23:00", arrivalTime: "07:00", price: 190.00 },
  
  { origin: "São Paulo", destination: "Uberlândia", company: "Gontijo", departureTime: "20:30", arrivalTime: "06:30", price: 230.00 },
  { origin: "São Paulo", destination: "Uberlândia", company: "Cometa", departureTime: "22:00", arrivalTime: "08:00", price: 240.00 },
  
  { origin: "São Paulo", destination: "Guarujá", company: "Cometa", departureTime: "07:30", arrivalTime: "09:00", price: 55.00 },
  { origin: "São Paulo", destination: "Guarujá", company: "Cometa", departureTime: "10:00", arrivalTime: "11:30", price: 55.00 },
  
  { origin: "São Paulo", destination: "São José do Rio Preto", company: "Cometa", departureTime: "09:00", arrivalTime: "15:00", price: 190.00 },
  { origin: "São Paulo", destination: "São José do Rio Preto", company: "Cometa", departureTime: "23:00", arrivalTime: "05:00", price: 180.00 },
  
  { origin: "São Paulo", destination: "Balneário Camboriú", company: "Catarinense", departureTime: "19:30", arrivalTime: "05:30", price: 250.00 },
  { origin: "São Paulo", destination: "Balneário Camboriú", company: "Catarinense", departureTime: "21:15", arrivalTime: "07:15", price: 260.00 },

  // --- HUB RIO DE JANEIRO E MINAS GERAIS ---
  { origin: "Rio de Janeiro", destination: "Belo Horizonte", company: "Cometa", departureTime: "08:00", arrivalTime: "15:30", price: 180.00 },
  { origin: "Rio de Janeiro", destination: "Belo Horizonte", company: "UTIL", departureTime: "23:30", arrivalTime: "07:00", price: 190.00 },
  { origin: "Rio de Janeiro", destination: "São Paulo", company: "1001", departureTime: "09:00", arrivalTime: "15:30", price: 160.00 },
  { origin: "Rio de Janeiro", destination: "Curitiba", company: "Penha", departureTime: "15:00", arrivalTime: "05:30", price: 300.00 },
  { origin: "Rio de Janeiro", destination: "Vitória", company: "Águia Branca", departureTime: "21:00", arrivalTime: "06:30", price: 220.00 },
  { origin: "Rio de Janeiro", destination: "Salvador", company: "Gontijo", departureTime: "14:00", arrivalTime: "22:00", price: 400.00 }, // Rota overnight de ~32h
  { origin: "Rio de Janeiro", destination: "Brasília", company: "UTIL", departureTime: "18:00", arrivalTime: "15:00", price: 450.00 }, // +1 dia
  { origin: "Rio de Janeiro", destination: "Florianópolis", company: "Penha", departureTime: "16:00", arrivalTime: "14:00", price: 350.00 }, // +1 dia
  { origin: "Rio de Janeiro", destination: "Campinas", company: "Cometa", departureTime: "22:00", arrivalTime: "05:30", price: 190.00 },
  
  { origin: "Belo Horizonte", destination: "Rio de Janeiro", company: "Cometa", departureTime: "09:00", arrivalTime: "16:30", price: 180.00 },
  { origin: "Belo Horizonte", destination: "São Paulo", company: "Gontijo", departureTime: "22:00", arrivalTime: "07:30", price: 150.00 },
  { origin: "Belo Horizonte", destination: "Salvador", company: "Gontijo", departureTime: "08:00", arrivalTime: "10:00", price: 500.00 }, // Rota overnight ~26h
  { origin: "Belo Horizonte", destination: "Vitória", company: "Águia Branca", departureTime: "21:30", arrivalTime: "08:00", price: 180.00 },
  { origin: "Belo Horizonte", destination: "Curitiba", company: "Cometa", departureTime: "17:00", arrivalTime: "09:00", price: 320.00 },
  { origin: "Belo Horizonte", destination: "Campinas", company: "Cometa", departureTime: "21:00", arrivalTime: "06:30", price: 220.00 },
  { origin: "Belo Horizonte", destination: "Brasília", company: "UTIL", departureTime: "20:00", arrivalTime: "08:30", price: 250.00 },

  // ROTAS DE VOLTA (SP -> Destinos)
  { origin: "Rio de Janeiro", destination: "São Paulo", company: "Auto Viação 1001", departureTime: "09:00", arrivalTime: "15:20", price: 150.00 },
  { origin: "Rio de Janeiro", destination: "São Paulo", company: "Cometa", departureTime: "23:00", arrivalTime: "05:10", price: 130.00 },
  { origin: "Curitiba", destination: "São Paulo", company: "Cometa", departureTime: "10:00", arrivalTime: "16:30", price: 120.00 },
  { origin: "Curitiba", destination: "São Paulo", company: "Penha", departureTime: "23:30", arrivalTime: "06:00", price: 140.00 },
  { origin: "Belo Horizonte", destination: "São Paulo", company: "Cometa", departureTime: "11:00", arrivalTime: "20:00", price: 150.00 },
  { origin: "Belo Horizonte", destination: "São Paulo", company: "Gontijo", departureTime: "22:00", arrivalTime: "06:30", price: 145.00 },
  { origin: "Florianópolis", destination: "São Paulo", company: "Catarinense", departureTime: "19:00", arrivalTime: "06:30", price: 250.00 },
  { origin: "Porto Alegre", destination: "São Paulo", company: "Penha", departureTime: "14:00", arrivalTime: "08:00", price: 380.00 },
  { origin: "Campinas", destination: "São Paulo", company: "Cometa", departureTime: "08:00", arrivalTime: "09:30", price: 50.00 },
  { origin: "Ribeirão Preto", destination: "São Paulo", company: "Cometa", departureTime: "10:00", arrivalTime: "14:30", price: 130.00 },
  { origin: "Santos", destination: "São Paulo", company: "Cometa", departureTime: "10:00", arrivalTime: "11:15", price: 45.00 },
  { origin: "Vitória", destination: "São Paulo", company: "Águia Branca", departureTime: "17:00", arrivalTime: "07:00", price: 300.00 },
  { origin: "Foz do Iguaçu", destination: "São Paulo", company: "Catarinense", departureTime: "15:00", arrivalTime: "07:30", price: 350.00 },
  { origin: "Joinville", destination: "São Paulo", company: "Catarinense", departureTime: "22:00", arrivalTime: "06:00", price: 180.00 },
  { origin: "Uberlândia", destination: "São Paulo", company: "Gontijo", departureTime: "21:00", arrivalTime: "07:00", price: 230.00 },
  { origin: "São José do Rio Preto", destination: "São Paulo", company: "Cometa", departureTime: "22:00", arrivalTime: "04:00", price: 180.00 },
  { origin: "Balneário Camboriú", destination: "São Paulo", company: "Catarinense", departureTime: "20:00", arrivalTime: "06:00", price: 250.00 },

  // --- HUB NORDESTE ---
  // Nordeste -> Sudeste
  { origin: "Salvador", destination: "São Paulo", company: "Gontijo", departureTime: "09:00", arrivalTime: "19:00", price: 500.00 },
  { origin: "Recife", destination: "São Paulo", company: "Gontijo", departureTime: "14:00", arrivalTime: "14:00", price: 700.00 },
  { origin: "Fortaleza", destination: "São Paulo", company: "Expresso Guanabara", departureTime: "08:30", arrivalTime: "19:30", price: 850.00 },
  { origin: "Natal", destination: "São Paulo", company: "Gontijo", departureTime: "10:00", arrivalTime: "12:00", price: 800.00 },
  { origin: "Salvador", destination: "Rio de Janeiro", company: "Águia Branca", departureTime: "13:00", arrivalTime: "20:00", price: 450.00 },
  { origin: "Recife", destination: "Rio de Janeiro", company: "Gontijo", departureTime: "11:00", arrivalTime: "06:00", price: 600.00 },
  { origin: "Fortaleza", destination: "Rio de Janeiro", company: "Expresso Guanabara", departureTime: "12:00", arrivalTime: "14:00", price: 750.00 },
  { origin: "Natal", destination: "Rio de Janeiro", company: "Gontijo", departureTime: "14:00", arrivalTime: "15:00", price: 850.00 },
  { origin: "Salvador", destination: "Belo Horizonte", company: "Gontijo", departureTime: "18:00", arrivalTime: "19:00", price: 400.00 },
  { origin: "Recife", destination: "Belo Horizonte", company: "Gontijo", departureTime: "12:00", arrivalTime: "08:00", price: 800.00 },
  
  // Rotas Internas Nordeste
  { origin: "Salvador", destination: "Recife", company: "Expresso Guanabara", departureTime: "19:00", arrivalTime: "08:00", price: 170.00 },
  { origin: "Fortaleza", destination: "Salvador", company: "Expresso Guanabara", departureTime: "15:00", arrivalTime: "15:00", price: 350.00 },
  { origin: "Natal", destination: "Fortaleza", company: "Expresso Guanabara", departureTime: "21:00", arrivalTime: "06:00", price: 120.00 },
  { origin: "Fortaleza", destination: "Recife", company: "Expresso Guanabara", departureTime: "18:00", arrivalTime: "07:00", price: 180.00 },
  { origin: "Natal", destination: "Recife", company: "Expresso São Luiz", departureTime: "08:00", arrivalTime: "13:30", price: 80.00 },

  // Sudeste -> Nordeste (Volta)
  { origin: "São Paulo", destination: "Salvador", company: "Gontijo", departureTime: "10:00", arrivalTime: "20:00", price: 500.00 },
  { origin: "São Paulo", destination: "Recife", company: "Gontijo", departureTime: "15:00", arrivalTime: "15:00", price: 700.00 },
  { origin: "São Paulo", destination: "Fortaleza", company: "Expresso Guanabara", departureTime: "09:00", arrivalTime: "20:00", price: 850.00 },
  { origin: "São Paulo", destination: "Natal", company: "Gontijo", departureTime: "11:00", arrivalTime: "13:00", price: 800.00 },
  { origin: "Rio de Janeiro", destination: "Salvador", company: "Águia Branca", departureTime: "14:00", arrivalTime: "21:00", price: 450.00 },
  { origin: "Rio de Janeiro", destination: "Recife", company: "Gontijo", departureTime: "12:00", arrivalTime: "07:00", price: 600.00 },
  { origin: "Rio de Janeiro", destination: "Fortaleza", company: "Expresso Guanabara", departureTime: "13:00", arrivalTime: "15:00", price: 750.00 },
  { origin: "Rio de Janeiro", destination: "Natal", company: "Gontijo", departureTime: "15:00", arrivalTime: "16:00", price: 850.00 },
  { origin: "Belo Horizonte", destination: "Salvador", company: "Gontijo", departureTime: "19:00", arrivalTime: "20:00", price: 400.00 },
  { origin: "Belo Horizonte", destination: "Recife", company: "Gontijo", departureTime: "13:00", arrivalTime: "09:00", price: 800.00 },
  
  // Rotas Internas Nordeste (Volta)
  { origin: "Recife", destination: "Salvador", company: "Expresso Guanabara", departureTime: "20:00", arrivalTime: "09:00", price: 170.00 },
  { origin: "Salvador", destination: "Fortaleza", company: "Expresso Guanabara", departureTime: "16:00", arrivalTime: "16:00", price: 350.00 },
  { origin: "Fortaleza", destination: "Natal", company: "Expresso Guanabara", departureTime: "22:00", arrivalTime: "07:00", price: 120.00 },
  { origin: "Recife", destination: "Fortaleza", company: "Expresso Guanabara", departureTime: "19:00", arrivalTime: "08:00", price: 180.00 },
  { origin: "Recife", destination: "Natal", company: "Expresso São Luiz", departureTime: "09:00", arrivalTime: "14:30", price: 80.00 }
];

// Carregar rotas atuais
let currentRoutes = [];
try {
  const data = fs.readFileSync(routesPath, 'utf8');
  currentRoutes = JSON.parse(data);
} catch (e) {
  console.log("Criando novo banco de dados...");
}

// Prevenir duplicações exatas
const isDuplicate = (route, db) => {
  return db.some(r => 
    r.origin === route.origin &&
    r.destination === route.destination &&
    r.company === route.company &&
    r.departureTime === route.departureTime
  );
};

let added = 0;
newRoutes.forEach(route => {
  if (!isDuplicate(route, currentRoutes)) {
    currentRoutes.push(route);
    added++;
  }
});

fs.writeFileSync(routesPath, JSON.stringify(currentRoutes, null, 2));
console.log(`Sucesso! ${added} rotas do Hub São Paulo foram injetadas.`);
