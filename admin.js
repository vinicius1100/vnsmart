const ADMIN_DEFAULT_PASSWORD = '1234';
const adminSessionKey = 'vnSmartAdminAuth';
const brlAdmin = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
let adminProducts = vnGetProducts();
let adminSellers = vnGetSellers();

function byId(id) { return document.getElementById(id); }
function show(id) { byId(id)?.classList.remove('hidden'); }
function hide(id) { byId(id)?.classList.add('hidden'); }

function adminIsAuthenticated() {
  return sessionStorage.getItem(adminSessionKey) === '1';
}

function openAdmin() {
  hide('adminLogin');
  show('adminApp');
  renderAdmin();
}

function closeAdmin() {
  sessionStorage.removeItem(adminSessionKey);
  show('adminLogin');
  hide('adminApp');
}

function getAdminPassword() {
  return localStorage.getItem('vnSmartAdminPassword') || ADMIN_DEFAULT_PASSWORD;
}

function categoryLabel(category) { return VN_CATEGORIES[category] || 'Categoria'; }
function saveAdminProducts() { vnSetProducts(adminProducts); }

function renderAdmin() {
  adminProducts = vnGetProducts();
  adminSellers = vnGetSellers();
  renderStats();
  renderAdminProducts();
  renderOrders();
  renderSellers();
}

function renderStats() {
  const active = adminProducts.filter(p => p.active !== false).length;
  const orders = vnGetOrders().length;
  byId('statProducts').textContent = active;
  byId('statOrders').textContent = orders;
  byId('statSellers').textContent = adminSellers.filter(s => s.active !== false).length;
}

function renderAdminProducts() {
  const list = byId('adminProducts');
  if (!list) return;
  const term = (byId('searchProducts').value || '').trim().toLowerCase();
  const cat = byId('filterCategory').value;
  const visible = adminProducts.filter(p => {
    const matchesTerm = !term || `${p.name} ${p.desc}`.toLowerCase().includes(term);
    const matchesCat = cat === 'todos' || p.category === cat;
    return matchesTerm && matchesCat;
  });
  if (!visible.length) {
    list.innerHTML = '<div class="admin-empty">Nenhum produto encontrado.</div>';
    return;
  }
  list.innerHTML = visible.map(product => `
    <article class="admin-product-row ${product.active === false ? 'inactive-product' : ''}">
      <div class="admin-product-icon">${escapeAdmin(product.icon || '◈')}</div>
      <div class="admin-product-data">
        <div class="admin-product-title-line"><h3>${escapeAdmin(product.name)}</h3>${product.active === false ? '<span class="status-pill off">Oculto</span>' : '<span class="status-pill on">Ativo</span>'}</div>
        <span class="product-category">${escapeAdmin(product.categoryLabel || categoryLabel(product.category))}</span>
        <p>${escapeAdmin(product.desc)}</p>
      </div>
      <div class="admin-product-price">${brlAdmin.format(Number(product.price) || 0)}</div>
      <div class="admin-product-actions">
        <button class="btn btn-outline btn-small" type="button" data-edit="${product.id}">EDITAR</button>
        <button class="btn btn-outline btn-small danger-btn" type="button" data-delete="${product.id}">EXCLUIR</button>
      </div>
    </article>`).join('');

  list.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => openEdit(Number(btn.dataset.edit))));
  list.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', () => deleteProduct(Number(btn.dataset.delete))));
}

function renderOrders() {
  const el = byId('adminOrders');
  if (!el) return;
  const orders = vnGetOrders();
  if (!orders.length) {
    el.innerHTML = '<div class="admin-empty">Nenhum pedido registrado ainda.</div>';
    return;
  }
  el.innerHTML = orders.slice(0, 8).map(order => `
    <div class="admin-order-card">
      <div class="order-top"><strong>${escapeAdmin(order.id)}</strong><span>${escapeAdmin(order.status || 'Novo')}</span></div>
      <div class="order-phone">📱 ${escapeAdmin(formatPhoneAdmin(order.phone))}</div>
      <div class="order-items">${order.items.map(item => `${item.qty}x ${escapeAdmin(item.name)}`).join('<br>')}</div>
      <div class="order-bottom"><small>${escapeAdmin(order.date)}</small><strong>${brlAdmin.format(Number(order.total) || 0)}</strong></div>
    </div>`).join('');
}

function formatPhoneAdmin(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function openNewProduct() {
  byId('productModalTitle').textContent = 'Novo produto';
  byId('productId').value = '';
  byId('productName').value = '';
  byId('productCategory').value = 'capas';
  byId('productDesc').value = '';
  byId('productPrice').value = '0.00';
  byId('productIcon').value = '◈';
  byId('productActive').checked = true;
  show('productModal');
  setTimeout(() => byId('productName').focus(), 50);
}

function openEdit(id) {
  const product = adminProducts.find(p => p.id === id);
  if (!product) return;
  byId('productModalTitle').textContent = 'Editar produto';
  byId('productId').value = String(product.id);
  byId('productName').value = product.name || '';
  byId('productCategory').value = product.category || 'capas';
  byId('productDesc').value = product.desc || '';
  byId('productPrice').value = Number(product.price || 0).toFixed(2);
  byId('productIcon').value = product.icon || '◈';
  byId('productActive').checked = product.active !== false;
  show('productModal');
}

function deleteProduct(id) {
  const product = adminProducts.find(p => p.id === id);
  if (!product) return;
  if (!confirm(`Excluir o produto “${product.name}”?`)) return;
  adminProducts = adminProducts.filter(p => p.id !== id);
  saveAdminProducts();
  renderAdmin();
}

function saveProductFromForm(event) {
  event.preventDefault();
  const id = Number(byId('productId').value);
  const category = byId('productCategory').value;
  const data = {
    category,
    categoryLabel: categoryLabel(category),
    name: byId('productName').value.trim(),
    desc: byId('productDesc').value.trim(),
    price: Number(byId('productPrice').value || 0),
    icon: byId('productIcon').value.trim() || '◈',
    active: byId('productActive').checked
  };
  if (!data.name || !data.desc || !Number.isFinite(data.price) || data.price < 0) return;
  if (id) {
    const index = adminProducts.findIndex(p => p.id === id);
    if (index >= 0) adminProducts[index] = { ...adminProducts[index], ...data };
  } else {
    const newId = adminProducts.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0) + 1;
    adminProducts.push({ id: newId, ...data });
  }
  saveAdminProducts();
  hide('productModal');
  renderAdmin();
}


function saveAdminSellers() {
  vnSetSellers(adminSellers);
}

function renderSellers() {
  const list = byId('adminSellers');
  if (!list) return;
  adminSellers = vnGetSellers();
  if (!adminSellers.length) {
    list.innerHTML = '<div class="admin-empty">Nenhuma conta de vendedor cadastrada.</div>';
    return;
  }
  list.innerHTML = adminSellers.map(seller => `
    <article class="admin-seller-row ${seller.active === false ? 'inactive-product' : ''}">
      <div class="seller-avatar">${escapeAdmin((seller.name || 'V').trim().charAt(0).toUpperCase())}</div>
      <div class="seller-data">
        <div class="seller-title-line"><h3>${escapeAdmin(seller.name)}</h3>${seller.active === false ? '<span class="status-pill off">Desativado</span>' : '<span class="status-pill on">Ativo</span>'}</div>
        <span class="seller-username">@${escapeAdmin(seller.username)}</span>
      </div>
      <div class="seller-credential"><span>Senha</span><strong>••••••</strong></div>
      <div class="admin-product-actions">
        <button class="btn btn-outline btn-small" type="button" data-edit-seller="${seller.id}">EDITAR</button>
        <button class="btn btn-outline btn-small danger-btn" type="button" data-delete-seller="${seller.id}">EXCLUIR</button>
      </div>
    </article>`).join('');

  list.querySelectorAll('[data-edit-seller]').forEach(btn => btn.addEventListener('click', () => openEditSeller(Number(btn.dataset.editSeller))));
  list.querySelectorAll('[data-delete-seller]').forEach(btn => btn.addEventListener('click', () => deleteSeller(Number(btn.dataset.deleteSeller))));
}

function openNewSeller() {
  byId('sellerModalTitle').textContent = 'Novo vendedor';
  byId('sellerId').value = '';
  byId('sellerName').value = '';
  byId('sellerUsername').value = '';
  byId('sellerPassword').value = '';
  byId('sellerPassword').required = true;
  byId('sellerActive').checked = true;
  show('sellerModal');
  setTimeout(() => byId('sellerName').focus(), 50);
}

function openEditSeller(id) {
  const seller = adminSellers.find(item => item.id === id);
  if (!seller) return;
  byId('sellerModalTitle').textContent = 'Editar vendedor';
  byId('sellerId').value = String(seller.id);
  byId('sellerName').value = seller.name || '';
  byId('sellerUsername').value = seller.username || '';
  byId('sellerPassword').value = seller.password || '';
  byId('sellerPassword').required = true;
  byId('sellerActive').checked = seller.active !== false;
  show('sellerModal');
}

function deleteSeller(id) {
  const seller = adminSellers.find(item => item.id === id);
  if (!seller) return;
  if (!confirm(`Excluir a conta do vendedor “${seller.name}”?`)) return;
  adminSellers = adminSellers.filter(item => item.id !== id);
  saveAdminSellers();
  renderAdmin();
}

function saveSellerFromForm(event) {
  event.preventDefault();
  const id = Number(byId('sellerId').value);
  const name = byId('sellerName').value.trim();
  const username = byId('sellerUsername').value.trim().toLowerCase().replace(/\s+/g, '');
  const password = byId('sellerPassword').value;
  const active = byId('sellerActive').checked;
  if (!name || !username || password.length < 4) return;

  const duplicate = adminSellers.find(s => s.username.toLowerCase() === username && s.id !== id);
  if (duplicate) {
    alert('Esse usuário já está cadastrado. Escolha outro.');
    return;
  }

  const duplicateName = adminSellers.find(s =>
    s.name.trim().toLowerCase() === name.toLowerCase() && s.id !== id
  );
  if (duplicateName) {
    alert('Já existe um vendedor com esse nome. Use um nome diferente.');
    return;
  }

  const data = { name, username, password, active };
  if (id) {
    const index = adminSellers.findIndex(s => s.id === id);
    if (index >= 0) adminSellers[index] = { ...adminSellers[index], ...data };
  } else {
    const newId = adminSellers.reduce((max, s) => Math.max(max, Number(s.id) || 0), 0) + 1;
    adminSellers.push({ id: newId, ...data });
  }

  saveAdminSellers();
  hide('sellerModal');
  renderAdmin();
}

function resetProducts() {
  if (!confirm('Restaurar os produtos padrão? Isso substituirá o catálogo atual.')) return;
  adminProducts = structuredClone(VN_DEFAULT_PRODUCTS);
  saveAdminProducts();
  renderAdmin();
}

function escapeAdmin(value) {
  return String(value ?? '').replace(/[&<>'"]/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#039;', '"':'&quot;' }[ch]));
}

function setupAdmin() {
  if (adminIsAuthenticated()) openAdmin();
  else show('adminLogin');

  byId('adminLoginForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const typed = byId('adminPassword').value;
    if (typed === getAdminPassword()) {
      sessionStorage.setItem(adminSessionKey, '1');
      byId('adminPassword').value = '';
      hide('adminLoginError');
      openAdmin();
    } else {
      byId('adminLoginError').textContent = 'Senha incorreta.';
    }
  });

  byId('logoutAdmin')?.addEventListener('click', closeAdmin);
  byId('newProduct')?.addEventListener('click', openNewProduct);
  byId('newSeller')?.addEventListener('click', openNewSeller);
  byId('closeProductModal')?.addEventListener('click', () => hide('productModal'));
  byId('cancelProduct')?.addEventListener('click', () => hide('productModal'));
  byId('productForm')?.addEventListener('submit', saveProductFromForm);
  byId('sellerForm')?.addEventListener('submit', saveSellerFromForm);
  byId('searchProducts')?.addEventListener('input', renderAdminProducts);
  byId('filterCategory')?.addEventListener('change', renderAdminProducts);
  byId('resetProducts')?.addEventListener('click', resetProducts);
  byId('productModal')?.addEventListener('click', event => { if (event.target.id === 'productModal') hide('productModal'); });
  byId('closeSellerModal')?.addEventListener('click', () => hide('sellerModal'));
  byId('cancelSeller')?.addEventListener('click', () => hide('sellerModal'));
  byId('sellerModal')?.addEventListener('click', event => { if (event.target.id === 'sellerModal') hide('sellerModal'); });
  window.addEventListener('storage', () => { if (adminIsAuthenticated()) renderAdmin(); });
}

setupAdmin();
