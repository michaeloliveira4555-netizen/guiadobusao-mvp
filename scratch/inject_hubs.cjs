const fs = require('fs');
const path = require('path');

const routesPath = path.join(__dirname, '../src/data/routes.json');
const routes = JSON.parse(fs.readFileSync(routesPath, 'utf8'));

const newRoutes = [
  // CAMPINAS
  { origin: 'Campinas', destination: 'Curitiba', company: 'Penha', departureTime: '21:30', price: 180.00 },
  { origin: 'Campinas', destination: 'Florianópolis', company: 'Catarinense', departureTime: '19:00', price: 220.00 },
  { origin: 'Campinas', destination: 'Balneário Camboriú', company: 'Catarinense', departureTime: '20:15', price: 210.00 },
  { origin: 'Campinas', destination: 'Foz do Iguaçu', company: 'Pluma', departureTime: '18:00', price: 280.00 },
  { origin: 'Campinas', destination: 'Rio de Janeiro', company: 'Cometa', departureTime: '08:00', price: 150.00 },
  { origin: 'Campinas', destination: 'Belo Horizonte', company: 'Cometa', departureTime: '22:00', price: 190.00 },
  { origin: 'Campinas', destination: 'Goiânia', company: 'Guanabara', departureTime: '16:30', price: 260.00 },
  { origin: 'Campinas', destination: 'Ribeirão Preto', company: 'Cometa', departureTime: '10:00', price: 95.00 },
  { origin: 'Curitiba', destination: 'Campinas', company: 'Penha', departureTime: '22:00', price: 180.00 },
  { origin: 'Florianópolis', destination: 'Campinas', company: 'Catarinense', departureTime: '18:30', price: 220.00 },

  // FOZ DO IGUAÇU
  { origin: 'Foz do Iguaçu', destination: 'São Paulo', company: 'Pluma', departureTime: '14:00', price: 290.00 },
  { origin: 'Foz do Iguaçu', destination: 'Rio de Janeiro', company: 'Pluma', departureTime: '11:00', price: 350.00 },
  { origin: 'Foz do Iguaçu', destination: 'Florianópolis', company: 'Catarinense', departureTime: '17:30', price: 250.00 },
  { origin: 'Foz do Iguaçu', destination: 'Balneário Camboriú', company: 'Catarinense', departureTime: '18:00', price: 240.00 },
  { origin: 'Foz do Iguaçu', destination: 'Porto Alegre', company: 'UneSul', departureTime: '19:00', price: 310.00 },
  { origin: 'Foz do Iguaçu', destination: 'Londrina', company: 'Garcia', departureTime: '22:30', price: 160.00 },
  { origin: 'Foz do Iguaçu', destination: 'Maringá', company: 'Garcia', departureTime: '23:00', price: 150.00 },
  { origin: 'Foz do Iguaçu', destination: 'Cascavel', company: 'Catarinense', departureTime: '08:00', price: 65.00 },
  { origin: 'São Paulo', destination: 'Foz do Iguaçu', company: 'Pluma', departureTime: '16:00', price: 290.00 },
  { origin: 'Curitiba', destination: 'Foz do Iguaçu', company: 'Catarinense', departureTime: '21:00', price: 190.00 },

  // BALNEÁRIO CAMBORIÚ
  { origin: 'Balneário Camboriú', destination: 'São Paulo', company: 'Catarinense', departureTime: '20:30', price: 185.00 },
  { origin: 'Balneário Camboriú', destination: 'Rio de Janeiro', company: 'Catarinense', departureTime: '15:00', price: 310.00 },
  { origin: 'Balneário Camboriú', destination: 'Porto Alegre', company: 'Santo Anjo', departureTime: '09:00', price: 140.00 },
  { origin: 'Balneário Camboriú', destination: 'Caxias do Sul', company: 'Penha', departureTime: '23:30', price: 170.00 },
  { origin: 'Balneário Camboriú', destination: 'Joinville', company: 'Catarinense', departureTime: '14:00', price: 55.00 },
  { origin: 'Balneário Camboriú', destination: 'Londrina', company: 'Brasil Sul', departureTime: '19:45', price: 210.00 },
  { origin: 'Balneário Camboriú', destination: 'Maringá', company: 'Brasil Sul', departureTime: '20:00', price: 225.00 },
  { origin: 'Balneário Camboriú', destination: 'Cascavel', company: 'Catarinense', departureTime: '21:15', price: 195.00 },
  { origin: 'Porto Alegre', destination: 'Balneário Camboriú', company: 'Santo Anjo', departureTime: '22:00', price: 140.00 },
  { origin: 'Curitiba', destination: 'Balneário Camboriú', company: 'Catarinense', departureTime: '10:30', price: 75.00 }
];

let added = 0;
for (const nr of newRoutes) {
  // Evitar duplicatas simples
  const exists = routes.find(r => r.origin === nr.origin && r.destination === nr.destination && r.company === nr.company);
  if (!exists) {
    // Definir URLs falsas para fallback (o redirect cuidará disso na vida real)
    nr.buyUrl = 'https://www.buson.com.br';
    routes.push(nr);
    added++;
  }
}

fs.writeFileSync(routesPath, JSON.stringify(routes, null, 2), 'utf8');
console.log(`Sucesso! Foram injetadas ${added} novas rotas focadas no Sul/SP.`);
