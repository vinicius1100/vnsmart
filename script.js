const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
let products = vnGetProducts();
let cart = JSON.parse(sessionStorage.getItem('vnSmartCart') || '[]');
let activeCategory = 'todos';

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function normalizePhone(value) { return value.replace(/\D/g, ''); }
function saveCart() { sessionStorage.setItem('vnSmartCart', JSON.stringify(cart)); }
function refreshProductsFromStorage() { products = vnGetProducts(); }

function addToCart(id) {
  refreshProductsFromStorage();
  const product = products.find(p => p.id === id && p.active !== false);
  if (!product) return;
  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCart();
  renderCart();
  renderProducts();
}

function removeFromCart(id) {
  const existing = cart.find(item => item.id === id);
  if (!existing) return;
  existing.qty -= 1;
  if (existing.qty <= 0) cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
  renderProducts();
}

function getCartQty(id) { return cart.find(item => item.id === id)?.qty || 0; }
function filteredProducts() {
  refreshProductsFromStorage();
  const visible = products.filter(product => product.active !== false);
  return activeCategory === 'todos' ? visible : visible.filter(product => product.category === activeCategory);
}

function renderProducts() {
  const list = document.getElementById('productList');
  if (!list) return;
  const visible = filteredProducts();
  if (!visible.length) {
    list.innerHTML = '<div class="empty-cart"><strong>Nenhum produto disponível.</strong><span>Use o painel administrativo para cadastrar produtos.</span></div>';
    return;
  }
  list.innerHTML = visible.map(product => {
    const qty = getCartQty(product.id);
    return `
      <article class="product-card ${qty ? 'selected' : ''}">
        <div class="product-thumb">${product.icon || '◈'}</div>
        <div class="product-info">
          <span class="product-category">${product.categoryLabel}</span>
          <h3>${escapeHtml(product.name)}</h3>
          <p>${escapeHtml(product.desc)}</p>
        </div>
        <div class="product-action">
          <div class="product-price">${brl.format(Number(product.price) || 0)}</div>
          <button class="btn ${qty ? 'btn-outline' : 'btn-primary'}" onclick="${qty ? `removeFromCart(${product.id})` : `addToCart(${product.id})`}">${qty ? `− ${qty}` : 'SELECIONAR'}</button>
          ${qty ? `<button class="btn btn-primary" onclick="addToCart(${product.id})">+1</button>` : ''}
        </div>
      </article>`;
  }).join('');
}

function renderCart() {
  refreshProductsFromStorage();
  const itemsEl = document.getElementById('cartItems');
  const countEl = document.getElementById('cartCount');
  const totalEl = document.getElementById('cartTotal');
  if (!itemsEl) return;
  let totalQty = 0;
  let total = 0;
  const validCart = [];
  cart.forEach(item => {
    const product = products.find(p => p.id === item.id && p.active !== false);
    if (!product) return;
    validCart.push(item);
    totalQty += item.qty;
    total += (Number(product.price) || 0) * item.qty;
  });
  cart = validCart;
  saveCart();

  if (!cart.length) {
    itemsEl.innerHTML = `<div class="empty-cart"><div class="empty-icon">🛒</div><strong>Nenhum item ainda</strong><span>Selecione um produto ao lado.</span></div>`;
  } else {
    itemsEl.innerHTML = cart.map(item => {
      const product = products.find(p => p.id === item.id);
      const subtotal = (Number(product.price) || 0) * item.qty;
      return `<div class="cart-item"><div class="cart-item-title">${escapeHtml(product.name)}</div><div class="cart-item-line"><span>${item.qty} x ${brl.format(Number(product.price) || 0)}</span><strong>${brl.format(subtotal)}</strong></div></div>`;
    }).join('');
  }
  if (countEl) countEl.textContent = `${totalQty} ${totalQty === 1 ? 'item' : 'itens'}`;
  if (totalEl) totalEl.textContent = brl.format(total);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#039;', '"':'&quot;' }[ch]));
}

function setupLogin() {
  const form = document.getElementById('phoneForm');
  const input = document.getElementById('phone');
  const error = document.getElementById('phoneError');
  if (!form || !input) return;
  input.addEventListener('input', () => { input.value = formatPhone(input.value); if (error) error.textContent = ''; });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const phone = normalizePhone(input.value);
    if (phone.length < 10 || phone.length > 11) {
      if (error) error.textContent = 'Digite um número de telefone válido com DDD.';
      input.focus();
      return;
    }
    sessionStorage.setItem('vnSmartPhone', phone);
    window.location.href = 'cliente.html';
  });
}

function setupProductsPage() {
  const badge = document.getElementById('phoneBadge');
  if (!badge) return;
  const phone = sessionStorage.getItem('vnSmartPhone');
  if (!phone) { window.location.href = 'index.html'; return; }
  badge.textContent = formatPhone(phone);
  renderProducts();
  renderCart();

  document.querySelectorAll('.category-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.category-tab').forEach(item => item.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.dataset.category;
      renderProducts();
    });
  });

  document.getElementById('changePhone')?.addEventListener('click', () => {
    sessionStorage.removeItem('vnSmartPhone');
    sessionStorage.removeItem('vnSmartCart');
    window.location.href = 'index.html';
  });

  document.getElementById('finishOrder')?.addEventListener('click', () => {
    refreshProductsFromStorage();
    if (!cart.length) { alert('Selecione pelo menos um produto.'); return; }
    const total = cart.reduce((sum, item) => {
      const product = products.find(p => p.id === item.id);
      return sum + (product ? (Number(product.price) || 0) * item.qty : 0);
    }, 0);
    const order = {
      id: `VN-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleString('pt-BR'),
      phone,
      items: cart.map(item => {
        const p = products.find(x => x.id === item.id);
        return { id: p.id, name: p.name, price: Number(p.price) || 0, qty: item.qty };
      }),
      total,
      status: 'Novo'
    };
    const orders = vnGetOrders();
    orders.unshift(order);
    vnSetOrders(orders);

    const modal = document.getElementById('successModal');
    const text = document.getElementById('successText');
    text.textContent = `Pedido ${order.id} recebido para ${formatPhone(phone)}. Total estimado: ${brl.format(total)}.`;
    modal.classList.remove('hidden');
  });

  document.getElementById('closeModal')?.addEventListener('click', () => {
    document.getElementById('successModal').classList.add('hidden');
    cart = [];
    saveCart();
    renderCart();
    renderProducts();
  });

  window.addEventListener('storage', () => { refreshProductsFromStorage(); renderProducts(); renderCart(); });
}

setupLogin();
setupProductsPage();
