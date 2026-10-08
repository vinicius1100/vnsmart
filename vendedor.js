const sellerLoginSessionKey = 'vnSmartSellerSession';

function sellerById(id) {
  return document.getElementById(id);
}

function sellerEscape(value) {
  return String(value ?? '').replace(/[&<>'"]/g, ch => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#039;', '"':'&quot;'
  }[ch]));
}

function findSeller(loginName, password) {
  const typedName = loginName.trim().toLowerCase();
  const sellers = vnGetSellers();

  return sellers.find(seller => {
    if (seller.active === false) return false;
    const nameMatches = String(seller.name || '').trim().toLowerCase() === typedName;
    const usernameMatches = String(seller.username || '').trim().toLowerCase() === typedName;
    return (nameMatches || usernameMatches) && String(seller.password || '') === password;
  }) || null;
}

function redirectToSellerLogin() {
  window.location.href = 'vendedor.html';
}

function logoutSeller() {
  vnClearSellerSession();
  window.location.href = 'vendedor.html';
}

function setupSellerLogin() {
  const form = sellerById('sellerLoginForm');
  if (!form) return;

  // Se já estiver conectado, não pede login novamente.
  if (vnGetSellerSession()) {
    window.location.href = 'painel-vendedor.html';
    return;
  }

  form.addEventListener('submit', event => {
    event.preventDefault();

    const name = sellerById('sellerLoginName').value;
    const password = sellerById('sellerLoginPassword').value;
    const error = sellerById('sellerLoginError');
    const seller = findSeller(name, password);

    if (!seller) {
      error.textContent = 'Nome ou senha incorretos, ou a conta está desativada.';
      sellerById('sellerLoginPassword').focus();
      return;
    }

    vnSetSellerSession(seller);
    error.textContent = '';
    window.location.href = 'painel-vendedor.html';
  });
}

function renderSellerPanel() {
  const session = vnGetSellerSession();
  if (!sellerById('sellerName')) return;

  if (!session) {
    redirectToSellerLogin();
    return;
  }

  // Confere novamente no cadastro do Admin para bloquear uma conta
  // que tenha sido desativada depois do login.
  const currentSeller = vnGetSellers().find(s => Number(s.id) === Number(session.id));
  if (!currentSeller || currentSeller.active === false) {
    vnClearSellerSession();
    alert('Sua conta foi desativada pelo administrador.');
    redirectToSellerLogin();
    return;
  }

  sellerById('sellerName').textContent = currentSeller.name;
  sellerById('sellerNameBadge').textContent = currentSeller.name;
  sellerById('profileName').textContent = currentSeller.name;
  sellerById('profileUsername').textContent = `@${currentSeller.username}`;
  sellerById('sellerAvatar').textContent = currentSeller.name.trim().charAt(0).toUpperCase() || 'V';

  const orders = vnGetOrders();
  const list = sellerById('sellerOrders');

  if (!orders.length) {
    list.innerHTML = '<div class="admin-empty">Nenhum pedido registrado ainda.</div>';
  } else {
    list.innerHTML = orders.slice(0, 8).map(order => `
      <div class="admin-order-card">
        <div class="order-top">
          <strong>${sellerEscape(order.id)}</strong>
          <span>${sellerEscape(order.status || 'Novo')}</span>
        </div>
        <div class="order-phone">📱 ${sellerEscape(formatSellerPhone(order.phone))}</div>
        <div class="order-items">${(order.items || []).map(item =>
          `${item.qty}x ${sellerEscape(item.name)}`).join('<br>')}</div>
        <div class="order-bottom">
          <small>${sellerEscape(order.date)}</small>
          <strong>${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
            .format(Number(order.total) || 0)}</strong>
        </div>
      </div>`).join('');
  }
}

function formatSellerPhone(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

document.addEventListener('DOMContentLoaded', () => {
  setupSellerLogin();
  renderSellerPanel();
  sellerById('sellerLogout')?.addEventListener('click', logoutSeller);
  sellerById('sellerLogout2')?.addEventListener('click', logoutSeller);
});
