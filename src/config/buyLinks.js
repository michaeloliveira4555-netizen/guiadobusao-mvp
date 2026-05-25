const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

const cityStates = {
  // Santa Catarina (SC)
  'florianopolis': 'sc',
  'joinville': 'sc',
  'balneario-camboriu': 'sc',
  'lages': 'sc',
  'chapeco': 'sc',
  'criciuma': 'sc',
  'tubarao': 'sc',
  'itajai': 'sc',

  // Paraná (PR)
  'curitiba': 'pr',
  'londrina': 'pr',
  'maringa': 'pr',
  'cascavel': 'pr',
  'foz-do-iguacu': 'pr',
  'ponta-grossa': 'pr'
}

const getCitySlugWithState = (city) => {
  const slug = slugify(city)
  const state = cityStates[slug] || 'rs'
  return `${slug}-${state}`
}

const companiesBuyUrls = {
  'uniao-santa-cruz': {
    platform: 'buson',
    baseUrl: 'https://www.buson.com.br/passagem-de-onibus'
  },
  'planalto': {
    platform: 'buson',
    baseUrl: 'https://www.buson.com.br/passagem-de-onibus'
  },
  'ouro-e-prata': {
    platform: 'buson',
    baseUrl: 'https://www.buson.com.br/passagem-de-onibus'
  },
  'expresso-azul': {
    platform: 'buson',
    baseUrl: 'https://www.buson.com.br/passagem-de-onibus'
  },
  'caxiense': {
    platform: 'buson',
    baseUrl: 'https://www.buson.com.br/passagem-de-onibus'
  },
  'citral': {
    platform: 'buson',
    baseUrl: 'https://www.buson.com.br/passagem-de-onibus'
  },
  'embaixador': {
    platform: 'buson',
    baseUrl: 'https://www.buson.com.br/passagem-de-onibus'
  },
  'frederes': {
    platform: 'buson',
    baseUrl: 'https://www.buson.com.br/passagem-de-onibus'
  },
  'santo-anjo': {
    platform: 'buson',
    baseUrl: 'https://www.buson.com.br/passagem-de-onibus'
  },
  // Demonstrando multiafiliação: Catarinense e Penha configuradas para usar ClickBus
  'catarinense': {
    platform: 'clickbus',
    baseUrl: 'https://www.clickbus.com.br/onibus'
  },
  'reunidas': {
    platform: 'buson',
    baseUrl: 'https://www.buson.com.br/passagem-de-onibus'
  },
  'penha': {
    platform: 'clickbus',
    baseUrl: 'https://www.clickbus.com.br/onibus'
  },
  'eucatur': {
    platform: 'buson',
    baseUrl: 'https://www.buson.com.br/passagem-de-onibus'
  },
  'nordeste': {
    platform: 'buson',
    baseUrl: 'https://www.buson.com.br/passagem-de-onibus'
  },
  'brasil-sul': {
    platform: 'buson',
    baseUrl: 'https://www.buson.com.br/passagem-de-onibus'
  }
}

export const getBuyLink = (companySlug, origin, destination, dateStr) => {
  const info = companiesBuyUrls[companySlug] || { platform: 'buson', baseUrl: 'https://www.buson.com.br/passagem-de-onibus' }
  
  const originPart = getCitySlugWithState(origin)
  const destPart = getCitySlugWithState(destination)
  
  // Garantir formato de data padrão YYYY-MM-DD para tratamento
  let formattedDate = ''
  if (dateStr) {
    if (dateStr.includes('-')) {
      formattedDate = dateStr
    } else if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/')
      formattedDate = `${year}-${month}-${day}`
    }
  } else {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    formattedDate = `${yyyy}-${mm}-${dd}`
  }

  let url = info.baseUrl
  if (info.platform === 'buson') {
    url = `${info.baseUrl}/${originPart}/${destPart}`
    if (process.env.BUSON_AFFILIATE_PREFIX) {
      url = process.env.BUSON_AFFILIATE_PREFIX + encodeURIComponent(url)
    }
  } else if (info.platform === 'clickbus') {
    url = `${info.baseUrl}/${originPart}/${destPart}?data=${formattedDate}`
    if (process.env.CLICKBUS_AFFILIATE_PREFIX) {
      url = process.env.CLICKBUS_AFFILIATE_PREFIX + encodeURIComponent(url)
    }
  }

  return url
}
