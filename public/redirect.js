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

  // 3. Função para gerar o slug estilo ClickBus (cidade-estado)
  // A ClickBus geralmente usa algo como "sao-paulo-sp-todos"
  // Como nem sempre temos a sigla do estado no banco, o mais seguro na ClickBus
  // quando não se tem o estado exato é usar apenas a cidade ou tentar a busca raiz.
  // Uma aproximação funcional na ClickBus:
  // "sao-paulo-sp-todos"
  function createClickBusSlug(cityName) {
    let slug = cityName.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    
    // Hardcode de estados comuns para cidades grandes (MVP)
    // No futuro o banco de dados deve fornecer a UF.
    if (slug === 'sao-paulo' || slug === 'campinas' || slug === 'ribeirao-preto' || slug === 'santos') slug += '-sp';
    else if (slug === 'rio-de-janeiro' || slug === 'niteroi') slug += '-rj';
    else if (slug === 'belo-horizonte' || slug === 'uberlandia') slug += '-mg';
    else if (slug === 'curitiba' || slug === 'foz-do-iguacu') slug += '-pr';
    else if (slug === 'florianopolis' || slug === 'joinville' || slug === 'balneario-camboriu') slug += '-sc';
    else if (slug === 'porto-alegre' || slug === 'santa-maria' || slug === 'caxias-do-sul') slug += '-rs';
    else if (slug === 'salvador') slug += '-ba';
    else if (slug === 'recife') slug += '-pe';
    else if (slug === 'fortaleza') slug += '-ce';
    else if (slug === 'natal') slug += '-rn';
    else if (slug === 'vitoria') slug += '-es';
    else if (slug === 'brasilia') slug += '-df';
    
    return slug + '-todos';
  }

  // 4. Construir o Deep Link
  let redirectUrl = 'https://www.clickbus.com.br'; // Fallback genérico
  
  if (origin && dest && date) {
    // Formata a data (espera YYYY-MM-DD e transforma no padrão que eles exigem, se for diferente, ou passa direto)
    // ClickBus aceita YYYY-MM-DD
    const originSlug = createClickBusSlug(decodeURIComponent(origin));
    const destSlug = createClickBusSlug(decodeURIComponent(dest));
    
    redirectUrl = `https://www.clickbus.com.br/onibus/${originSlug}/${destSlug}?data=${date}`;
  }

  // 5. Redirecionar após a animação (3.5 segundos)
  setTimeout(() => {
    window.location.replace(redirectUrl);
  }, 3500);
});
