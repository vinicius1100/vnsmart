const VN_DEFAULT_PRODUCTS = [
  { id: 1, category: 'capas', categoryLabel: 'Capas', name: 'Capa silicone', desc: 'Capa simples e resistente para proteção diária.', price: 19.90, icon: '▱', active: true },
  { id: 2, category: 'capas', categoryLabel: 'Capas', name: 'Capa anti-impacto', desc: 'Proteção reforçada contra quedas e impactos.', price: 29.90, icon: '◈', active: true },
  { id: 3, category: 'fones-bluetooth', categoryLabel: 'Fones Bluetooth', name: 'Fone Bluetooth', desc: 'Fone sem fio com estojo de carregamento.', price: 59.90, icon: '◉', active: true },
  { id: 4, category: 'fones-bluetooth', categoryLabel: 'Fones Bluetooth', name: 'Fone Bluetooth Premium', desc: 'Modelo sem fio com som e autonomia superiores.', price: 89.90, icon: '◉', active: true },
  { id: 5, category: 'fones-com-fio', categoryLabel: 'Fones com fio', name: 'Fone com fio', desc: 'Fone com conexão física para uso no dia a dia.', price: 24.90, icon: '♬', active: true },
  { id: 6, category: 'carregadores', categoryLabel: 'Carregadores', name: 'Carregador turbo', desc: 'Carregador rápido para uso diário.', price: 59.90, icon: '⚡', active: true },
  { id: 7, category: 'carregadores', categoryLabel: 'Carregadores', name: 'Carregador USB-C', desc: 'Carregador compatível com aparelhos USB-C.', price: 49.90, icon: '▰', active: true },
  { id: 8, category: 'carregadores', categoryLabel: 'Carregadores', name: 'Carregador para iPhone', desc: 'Carregador para aparelhos com conector compatível.', price: 69.90, icon: '▰', active: true }
];

const VN_CATEGORIES = {
  capas: 'Capas',
  'fones-bluetooth': 'Fones Bluetooth',
  'fones-com-fio': 'Fones com fio',
  carregadores: 'Carregadores'
};

function vnGetProducts() {
  const saved = localStorage.getItem('vnSmartProducts');
  if (!saved) {
    localStorage.setItem('vnSmartProducts', JSON.stringify(VN_DEFAULT_PRODUCTS));
    return structuredClone(VN_DEFAULT_PRODUCTS);
  }
  try {
    const products = JSON.parse(saved);
    return Array.isArray(products) ? products : structuredClone(VN_DEFAULT_PRODUCTS);
  } catch {
    localStorage.setItem('vnSmartProducts', JSON.stringify(VN_DEFAULT_PRODUCTS));
    return structuredClone(VN_DEFAULT_PRODUCTS);
  }
}

function vnSetProducts(products) {
  localStorage.setItem('vnSmartProducts', JSON.stringify(products));
}

function vnGetOrders() {
  try {
    const orders = JSON.parse(localStorage.getItem('vnSmartOrders') || '[]');
    return Array.isArray(orders) ? orders : [];
  } catch {
    return [];
  }
}

function vnSetOrders(orders) {
  localStorage.setItem('vnSmartOrders', JSON.stringify(orders));
}

const VN_DEFAULT_SELLERS = [];

function vnGetSellers() {
  const saved = localStorage.getItem('vnSmartSellers');
  if (!saved) {
    localStorage.setItem('vnSmartSellers', JSON.stringify(VN_DEFAULT_SELLERS));
    return structuredClone(VN_DEFAULT_SELLERS);
  }
  try {
    const sellers = JSON.parse(saved);
    return Array.isArray(sellers) ? sellers : structuredClone(VN_DEFAULT_SELLERS);
  } catch {
    localStorage.setItem('vnSmartSellers', JSON.stringify(VN_DEFAULT_SELLERS));
    return structuredClone(VN_DEFAULT_SELLERS);
  }
}

function vnSetSellers(sellers) {
  localStorage.setItem('vnSmartSellers', JSON.stringify(sellers));
}



const VN_SELLER_SESSION_KEY = 'vnSmartSellerSession';

function vnGetSellerSession() {
  try {
    const saved = sessionStorage.getItem(VN_SELLER_SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function vnSetSellerSession(seller) {
  sessionStorage.setItem(VN_SELLER_SESSION_KEY, JSON.stringify({
    id: seller.id,
    name: seller.name,
    username: seller.username
  }));
}

function vnClearSellerSession() {
  sessionStorage.removeItem(VN_SELLER_SESSION_KEY);
}

const VN_CUSTOMER_SESSION_KEY = 'vnSmartCustomerSession';
function vnGetCustomerSession() {
  try {
    const saved = sessionStorage.getItem(VN_CUSTOMER_SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}
function vnSetCustomerSession(phone) {
  sessionStorage.setItem(VN_CUSTOMER_SESSION_KEY, JSON.stringify({ phone: String(phone || '') }));
  sessionStorage.setItem('vnSmartPhone', String(phone || ''));
}
function vnClearCustomerSession() {
  sessionStorage.removeItem(VN_CUSTOMER_SESSION_KEY);
  sessionStorage.removeItem('vnSmartPhone');
}
