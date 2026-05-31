document.addEventListener('DOMContentLoaded', () => {
  // 1. Pegar parâmetros da URL
  const urlParams = new URLSearchParams(window.location.search);
  const origin = urlParams.get('origin');
  const dest = urlParams.get('dest');
  const date = urlParams.get('date');
  const company = urlParams.get('company') || 'viação parceira';

  // 2. Preencher a UI se tivermos os dados
  if (origin && dest) {
    document.getElementById('route-details').style.display = 'block';
    document.getElementById('val-origin').textContent = decodeURIComponent(origin);
    document.getElementById('val-dest').textContent = decodeURIComponent(dest);
    document.getElementById('status-title').textContent = `Transferindo para a ${decodeURIComponent(company)}...`;
  }

  // 3. Construir o Deep Link (Awin / Quero Passagem)
  let redirectUrl = 'https://tidd.ly/42W1t0i'; // Link oficial Awin (Quero Passagem)
  
  if (origin && dest && date) {
    const originParam = encodeURIComponent(decodeURIComponent(origin));
    const destParam = encodeURIComponent(decodeURIComponent(dest));
    
    // Concatena os dados da busca atual à URL base do link profundo da Awin
    redirectUrl = `https://tidd.ly/42W1t0i?origin=${originParam}&dest=${destParam}&date=${date}`;
  }

  // 4. Redirecionar após a animação (3.5 segundos)
  setTimeout(() => {
    window.location.replace(redirectUrl);
  }, 3500);
});
