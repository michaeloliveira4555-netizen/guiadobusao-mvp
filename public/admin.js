let adminPassword = localStorage.getItem('admin_password') || '';
let currentRoutes = [];

// DOM Elements
const loginOverlay = document.getElementById('login-overlay');
const loginBtn = document.getElementById('login-btn');
const passwordInput = document.getElementById('password-input');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

const tbody = document.getElementById('routes-tbody');
const totalRoutes = document.getElementById('total-routes');
const addForm = document.getElementById('add-route-form');

// --- Auth Logic ---
if (adminPassword) {
  checkAuth();
}

loginBtn.addEventListener('click', async () => {
  const pwd = passwordInput.value;
  if (!pwd) return;
  adminPassword = pwd;
  await checkAuth();
});

passwordInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') loginBtn.click();
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('admin_password');
  adminPassword = '';
  loginOverlay.style.display = 'flex';
  passwordInput.value = '';
});

async function checkAuth() {
  loginBtn.textContent = 'Verificando...';
  try {
    const res = await fetch('/api/admin/routes', {
      headers: { 'Authorization': adminPassword }
    });
    
    if (res.ok) {
      localStorage.setItem('admin_password', adminPassword);
      loginOverlay.style.display = 'none';
      const data = await res.json();
      currentRoutes = data;
      renderRoutes();
    } else {
      throw new Error('Senha incorreta');
    }
  } catch (err) {
    localStorage.removeItem('admin_password');
    adminPassword = '';
    loginError.style.display = 'block';
  } finally {
    loginBtn.textContent = 'Entrar';
  }
}

// --- Render Logic ---
function renderRoutes() {
  totalRoutes.textContent = `${currentRoutes.length} rotas carregadas`;
  tbody.innerHTML = '';
  
  if (currentRoutes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center">Nenhuma rota cadastrada.</td></tr>';
    return;
  }

  // Ordenar as últimas adicionadas primeiro (vamos apenas inverter o array por enquanto)
  const sorted = [...currentRoutes].reverse();

  sorted.forEach((r, index) => {
    // Calculando o ID real no array original caso precisemos deletar
    const realIndex = currentRoutes.length - 1 - index;
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.origin}</td>
      <td>${r.destination}</td>
      <td>${r.company}</td>
      <td>${r.departureTime}</td>
      <td>${r.arrivalTime}</td>
      <td>R$ ${parseFloat(r.price).toFixed(2)}</td>
      <td>
        <button class="action-btn" onclick="deleteRoute(${realIndex})">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// --- Add Logic ---
addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const submitBtn = document.getElementById('submit-route-btn');
  submitBtn.textContent = 'Salvando...';
  submitBtn.disabled = true;

  const newRoute = {
    origin: document.getElementById('route-origin').value.trim(),
    destination: document.getElementById('route-destination').value.trim(),
    company: document.getElementById('route-company').value.trim(),
    price: parseFloat(document.getElementById('route-price').value),
    departureTime: document.getElementById('route-departure').value,
    arrivalTime: document.getElementById('route-arrival').value,
    link: document.getElementById('route-link').value.trim() || undefined
  };

  try {
    const res = await fetch('/api/admin/routes', {
      method: 'POST',
      headers: { 
        'Authorization': adminPassword,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newRoute)
    });

    if (res.ok) {
      addForm.reset();
      // Recarrega as rotas
      await checkAuth();
    } else {
      alert('Erro ao salvar a rota.');
    }
  } catch (err) {
    alert('Erro de conexão.');
  } finally {
    submitBtn.textContent = 'Adicionar Rota';
    submitBtn.disabled = false;
  }
});

// --- Delete Logic ---
window.deleteRoute = async (index) => {
  if (!confirm('Tem certeza que deseja excluir esta rota permanentemente?')) return;
  
  try {
    const res = await fetch(`/api/admin/routes/${index}`, {
      method: 'DELETE',
      headers: { 'Authorization': adminPassword }
    });

    if (res.ok) {
      // Recarrega
      await checkAuth();
    } else {
      alert('Erro ao excluir a rota.');
    }
  } catch (err) {
    alert('Erro de conexão.');
  }
};
