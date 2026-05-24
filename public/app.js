// =============================================
// ConectaBus — Frontend Logic
// Autocomplete, Busca, Renderização de Rotas
// =============================================

const API_BASE = '/api'

// === DOM Elements ===
const searchForm = document.getElementById('search-form')
const originInput = document.getElementById('origin-input')
const destinationInput = document.getElementById('destination-input')
const dateInput = document.getElementById('date-input')
const originAutocomplete = document.getElementById('origin-autocomplete')
const destinationAutocomplete = document.getElementById('destination-autocomplete')
const swapBtn = document.getElementById('swap-btn')
const resultsHeader = document.getElementById('results-header')
const resultsTitle = document.getElementById('results-title')
const loadingContainer = document.getElementById('loading-container')
const noResults = document.getElementById('no-results')
const itineraryList = document.getElementById('itinerary-list')

let currentItineraries = []
let displayedItineraries = []
let CITIES = []

// === Data Padrão (Hoje) ===
if (dateInput) {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  dateInput.value = `${yyyy}-${mm}-${dd}`
  dateInput.min = `${yyyy}-${mm}-${dd}`
}

// === Auto Run Search on Load if inputs have values ===
async function autoSearch() {
  const origin = originInput.value.trim()
  const destination = destinationInput.value.trim()
  
  if (origin && destination) {
    // Simula a submissão do formulário de busca
    searchForm.dispatchEvent(new Event('submit'))
  }
}

// === Carregar cidades da API ===
async function loadCities() {
  try {
    const res = await fetch(`${API_BASE}/cities`)
    const data = await res.json()
    CITIES = data.cities || []
  } catch (err) {
    console.error('Erro ao carregar cidades:', err)
  }
}

loadCities().then(() => {
  autoSearch()
})

// === Autocomplete ===
function setupAutocomplete(input, listEl) {
  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase()
    listEl.innerHTML = ''

    if (query.length < 1) {
      listEl.classList.remove('active')
      return
    }

    const matches = CITIES.filter(city => city.toLowerCase().includes(query))

    if (matches.length === 0) {
      listEl.classList.remove('active')
      return
    }

    matches.forEach(city => {
      const li = document.createElement('li')
      li.textContent = city
      li.addEventListener('click', () => {
        input.value = city
        listEl.classList.remove('active')
      })
      listEl.appendChild(li)
    })

    listEl.classList.add('active')
  })

  input.addEventListener('focus', () => {
    if (input.value.trim().length >= 1) {
      input.dispatchEvent(new Event('input'))
    }
  })

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !listEl.contains(e.target)) {
      listEl.classList.remove('active')
    }
  })
}

setupAutocomplete(originInput, originAutocomplete)
setupAutocomplete(destinationInput, destinationAutocomplete)

// === Swap ===
swapBtn.addEventListener('click', () => {
  const temp = originInput.value
  originInput.value = destinationInput.value
  destinationInput.value = temp
})

searchForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  const origin = originInput.value.trim()
  const destination = destinationInput.value.trim()
  const date = dateInput ? dateInput.value : ''

  if (!origin || !destination) return

  showLoading()

  try {
    const url = `${API_BASE}/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(date)}`
    const response = await fetch(url)
    const data = await response.json()

    await new Promise(resolve => setTimeout(resolve, 500))

    currentItineraries = data.itineraries || []
    hideLoading()

    if (currentItineraries.length === 0) {
      showNoResults()
    } else {
      showResults(origin, destination, currentItineraries)
    }
  } catch (err) {
    console.error('Erro na busca:', err)
    hideLoading()
    showNoResults()
  }
})

// === Sort Buttons ===
document.querySelectorAll('.sort-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    sortAndRender(btn.dataset.sort)
  })
})

function sortAndRender(sortType) {
  const sorted = [...currentItineraries]

  switch (sortType) {
    case 'fastest':
      sorted.sort((a, b) => a.totalTimeMinutes - b.totalTimeMinutes)
      break
    case 'cheapest':
      sorted.sort((a, b) => a.totalPrice - b.totalPrice)
      break
    case 'less-stops':
      sorted.sort((a, b) => {
        if (a.stops !== b.stops) return a.stops - b.stops
        return a.totalTimeMinutes - b.totalTimeMinutes
      })
      break
  }

  renderItineraries(sorted)
}

// === UI State ===
function showLoading() {
  resultsHeader.style.display = 'none'
  noResults.style.display = 'none'
  itineraryList.innerHTML = ''
  loadingContainer.style.display = 'block'
}

function hideLoading() {
  loadingContainer.style.display = 'none'
}

function showNoResults() {
  resultsHeader.style.display = 'none'
  noResults.style.display = 'block'
}

function showResults(origin, destination, itineraries) {
  noResults.style.display = 'none'
  resultsHeader.style.display = 'flex'
  resultsTitle.textContent = `${itineraries.length} rota${itineraries.length > 1 ? 's' : ''} encontrada${itineraries.length > 1 ? 's' : ''} de ${origin} para ${destination}`

  document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'))
  document.getElementById('sort-fastest').classList.add('active')

  renderItineraries(itineraries)
}

// === Helpers ===
function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

function formatPrice(price) {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function segmentDuration(depTime, arrTime) {
  const [dh, dm] = depTime.split(':').map(Number)
  const [ah, am] = arrTime.split(':').map(Number)
  let diff = (ah * 60 + am) - (dh * 60 + dm)
  if (diff < 0) diff += 1440
  return diff
}

// === Render ===
function renderItineraries(itineraries) {
  displayedItineraries = itineraries
  itineraryList.innerHTML = ''

  itineraries.forEach((itin, index) => {
    const card = document.createElement('div')
    card.className = 'itinerary-card'
    card.style.animationDelay = `${index * 80}ms`
    card.innerHTML = renderCard(itin, index)
    itineraryList.appendChild(card)
  })
}

function renderCard(itin, index) {
  const segments = itin.segments
  const connections = itin.connections || []

  // Badge
  let badgeHTML = ''
  if (itin.type === 'direct') {
    badgeHTML = `
      <span class="card-badge badge-direct">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        Direto
      </span>`
  } else {
    const connectionNames = connections.map(c => c.city).join(' · ')
    badgeHTML = `
      <span class="card-badge badge-connection">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
        ${itin.stops} conex${itin.stops > 1 ? 'ões' : 'ão'} · ${connectionNames}
      </span>`
  }

  // Timeline
  let timelineHTML = ''

  segments.forEach((seg, i) => {
    const duration = segmentDuration(seg.departureTime, seg.arrivalTime)

    // Ponto de partida do trecho
    const dotClass = i === 0 ? '' : ' dot-connection'
    const stopLabel = i === 0 ? 'Rodoviária · Partida' : 'Conexão · Partida'

    timelineHTML += `
      <div class="timeline-stop">
        <div class="timeline-dot${dotClass}"></div>
        <div class="stop-info">
          <div>
            <div class="stop-city">${seg.origin}</div>
            <div class="stop-detail">${stopLabel}</div>
          </div>
          <div class="stop-time">${seg.departureTime}</div>
        </div>
      </div>

      <div class="segment-info">
        <span class="segment-company">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="3"/><circle cx="7.5" cy="21" r="1.5"/><circle cx="16.5" cy="21" r="1.5"/></svg>
          ${seg.company}
        </span>
        <span class="segment-duration">${formatMinutes(duration)} de viagem</span>
        <span class="segment-price">${formatPrice(seg.price)}</span>
      </div>`

    // Se há conexão após este segmento, mostrar chegada + espera
    if (i < segments.length - 1) {
      const conn = connections[i]
      timelineHTML += `
        <div class="timeline-stop">
          <div class="timeline-dot dot-connection"></div>
          <div class="stop-info">
            <div>
              <div class="stop-city">${seg.destination}</div>
              <div class="stop-detail">Conexão · Chegada</div>
            </div>
            <div class="stop-time">${seg.arrivalTime}</div>
          </div>
        </div>

        <div class="connection-banner">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>Espera na rodoviária de <strong>${conn.city}</strong>: <strong>${formatMinutes(conn.waitTimeMinutes)}</strong></span>
        </div>`
    }
  })

  // Ponto final de chegada
  const lastSeg = segments[segments.length - 1]
  timelineHTML += `
    <div class="timeline-stop">
      <div class="timeline-dot dot-end"></div>
      <div class="stop-info">
        <div>
          <div class="stop-city">${lastSeg.destination}</div>
          <div class="stop-detail">Rodoviária · Chegada</div>
        </div>
        <div class="stop-time">${lastSeg.arrivalTime}</div>
      </div>
    </div>`

  // Empresas envolvidas
  const companies = [...new Set(segments.map(s => s.company))]
  const companiesText = companies.join(' + ')

  // Footer
  let footerExtra = ''
  if (itin.stops > 0) {
    footerExtra = ' (incluindo espera)'
  }

  // Seção de Ações de Compra
  let buyActionsHTML = ''
  if (itin.type === 'direct') {
    const buyUrl = segments[0].buyUrl || '#'
    buyActionsHTML = `
      <div class="card-buy-actions">
        <a href="${buyUrl}" target="_blank" rel="noopener noreferrer" class="buy-btn buy-btn-direct">
           Comprar Passagem
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
      </div>`
  } else {
    let segmentButtonsHTML = ''
    segments.forEach((seg, i) => {
      const buyUrl = seg.buyUrl || '#'
      segmentButtonsHTML += `
        <a href="${buyUrl}" target="_blank" rel="noopener noreferrer" class="buy-btn-segment">
          <span>Trecho ${i + 1} (${seg.company}): ${seg.origin} ➜ ${seg.destination}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>`
    })

    buyActionsHTML = `
      <div class="card-buy-actions">
        <div class="connection-warning-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>Esta viagem possui conexão. São necessárias passagens separadas.</span>
        </div>
        <button onclick="window.openBuyModal(${index})" class="buy-btn buy-btn-complete">
          Comprar Viagem Completa
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
        <div class="buy-segments-toggle-container">
          <button onclick="window.toggleSegments(${index})" class="toggle-segments-btn" id="toggle-btn-${index}">
            <span>Comprar trechos individualmente</span>
            <svg class="toggle-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="buy-segments-list" id="segments-list-${index}" style="display: none;">
            ${segmentButtonsHTML}
          </div>
        </div>
      </div>`
  }

  return `
    <div class="card-header">
      ${badgeHTML}
      <span class="card-price">${formatPrice(itin.totalPrice)}<small>/ pessoa</small></span>
    </div>

    <div class="timeline">
      ${timelineHTML}
    </div>

    <div class="card-footer">
      <span class="card-total-time">
        Tempo total: <strong>${formatMinutes(itin.totalTimeMinutes)}</strong>${footerExtra}
      </span>
      <span class="card-companies">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="3"/><circle cx="7.5" cy="21" r="1.5"/><circle cx="16.5" cy="21" r="1.5"/></svg>
        ${companiesText}
      </span>
    </div>
    
    ${buyActionsHTML}`
}

// === Modal de Confirmação & Compras ===
const buyModal = document.getElementById('buy-modal')
const modalClose = document.getElementById('modal-close')
const modalCancel = document.getElementById('modal-cancel')
const modalConfirm = document.getElementById('modal-confirm')
const modalBody = document.getElementById('modal-body')
let selectedItinerary = null
let currentStep = 0

window.openBuyModal = (index) => {
  const itin = displayedItineraries[index]
  if (!itin) return

  selectedItinerary = itin
  currentStep = 0

  // Ocultar a div de alerta antiga para evitar redundância visual
  const modalAlert = document.querySelector('.modal-alert')
  if (modalAlert) {
    modalAlert.style.display = 'none'
  }

  buyModal.style.display = 'flex'
  renderModalStep()
}

function renderModalStep() {
  if (!selectedItinerary) return

  const totalSegments = selectedItinerary.segments.length

  if (currentStep < totalSegments) {
    const seg = selectedItinerary.segments[currentStep]

    // Atualizar títulos do modal
    const modalTitle = document.querySelector('.modal-title')
    const modalSubtitle = document.querySelector('.modal-subtitle')
    if (modalTitle) {
      modalTitle.textContent = `Assistente de Compra: Passo ${currentStep + 1} de ${totalSegments}`
    }
    if (modalSubtitle) {
      modalSubtitle.textContent = 'Guia passo a passo para reservar as suas passagens com segurança.'
    }

    // Gerar barra de progresso
    let progressDotsHTML = ''
    for (let idx = 0; idx < totalSegments; idx++) {
      const activeClass = idx === currentStep ? 'active' : (idx < currentStep ? 'completed' : '')
      const content = idx < currentStep ? '✓' : idx + 1
      progressDotsHTML += `<div class="step-dot ${activeClass}">${content}</div>`
      if (idx < totalSegments - 1) {
        progressDotsHTML += '<div class="step-line"></div>'
      }
    }

    let bodyHTML = `
      <div class="step-guide-container">
        <div class="step-progress-bar">
          ${progressDotsHTML}
        </div>

        <div class="step-details-card">
          <div class="step-badge">Trecho ${currentStep + 1} de ${totalSegments}</div>
          <h5 class="step-route-title">${seg.origin} ➔ ${seg.destination}</h5>
          
          <div class="step-instruction-box">
            <p>Clique no botão abaixo. No site da <strong>${seg.company}</strong> que será aberto, selecione:</p>
            
            <div class="step-highlight-info">
              <div class="info-row">
                <span class="info-label">Horário Recomendado:</span>
                <span class="info-val highlight-orange">${seg.departureTime}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Preço Estimado:</span>
                <span class="info-val">${formatPrice(seg.price)}</span>
              </div>
            </div>
            
            <p class="step-note-alert">ℹ️ As plataformas parceiras não permitem pré-selecionar o horário via link. Escolha a opção correspondente ao chegar na página de destino.</p>
          </div>
        </div>
      </div>
    `

    modalBody.innerHTML = bodyHTML

    if (modalConfirm) {
      modalConfirm.textContent = `Ir para o Passo ${currentStep + 1} (Abrir Site) ➜`
      modalConfirm.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
      modalConfirm.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)'
    }
  } else {
    // Tela de conclusão final
    const modalTitle = document.querySelector('.modal-title')
    const modalSubtitle = document.querySelector('.modal-subtitle')
    if (modalTitle) {
      modalTitle.textContent = 'Boa Viagem!'
    }
    if (modalSubtitle) {
      modalSubtitle.textContent = 'Você abriu todos os links para compra dos trechos.'
    }

    let bodyHTML = `
      <div class="success-step-container">
        <div class="success-checkmark-circle">✓</div>
        <h5>Excelente! Viagem Completa Aberta</h5>
        <p>As páginas oficiais de cada empresa de ônibus estão prontas em outras abas. Complete o pagamento em cada uma delas para consolidar sua viagem.</p>
        
        <div class="summary-box">
          <div class="summary-row">
            <span>Preço Total Estimado:</span>
            <strong>${formatPrice(selectedItinerary.totalPrice)}</strong>
          </div>
        </div>
      </div>
    `

    modalBody.innerHTML = bodyHTML

    if (modalConfirm) {
      modalConfirm.textContent = 'Fechar e Concluir'
      modalConfirm.style.background = 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%)'
      modalConfirm.style.boxShadow = '0 4px 15px rgba(0, 212, 255, 0.3)'
    }
  }
}

function closeBuyModal() {
  buyModal.style.display = 'none'
  selectedItinerary = null
  currentStep = 0
}

if (modalClose) modalClose.addEventListener('click', closeBuyModal)
if (modalCancel) modalCancel.addEventListener('click', closeBuyModal)
if (buyModal) {
  buyModal.addEventListener('click', (e) => {
    if (e.target === buyModal) {
      closeBuyModal()
    }
  })
}

if (modalConfirm) {
  modalConfirm.addEventListener('click', () => {
    if (!selectedItinerary) return

    const totalSegments = selectedItinerary.segments.length

    if (currentStep < totalSegments) {
      const seg = selectedItinerary.segments[currentStep]
      if (seg.buyUrl) {
        window.open(seg.buyUrl, '_blank')
      }
      currentStep++
      renderModalStep()
    } else {
      closeBuyModal()
    }
  })
}

window.toggleSegments = (index) => {
  const list = document.getElementById(`segments-list-${index}`)
  const btn = document.getElementById(`toggle-btn-${index}`)
  if (list && btn) {
    const isHidden = list.style.display === 'none'
    list.style.display = isHidden ? 'flex' : 'none'
    btn.classList.toggle('active', isHidden)
  }
}
