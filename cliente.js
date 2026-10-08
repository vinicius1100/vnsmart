function customerEscape(value) {
  return String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[ch]));
}
function formatCustomerPhone(value) {
  const d=String(value||'').replace(/\D/g,'').slice(0,11);
  if(d.length<=2)return d;if(d.length<=7)return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if(d.length<=10)return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}
function loadCustomerPanel(){
  const phone=vnGetCustomerSession()?.phone || sessionStorage.getItem('vnSmartPhone');
  if(!phone){window.location.href='index.html';return;}
  vnSetCustomerSession(phone);
  document.getElementById('customerPhoneBadge').textContent=formatCustomerPhone(phone);
  document.getElementById('customerPhone').textContent=formatCustomerPhone(phone);
  const orders=vnGetOrders().filter(o=>String(o.phone||'').replace(/\D/g,'')===String(phone).replace(/\D/g,''));
  const list=document.getElementById('customerOrders');
  if(!orders.length){list.innerHTML='<div class="admin-empty">Você ainda não possui pedidos.</div>';return;}
  const brl=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
  list.innerHTML=orders.slice(0,10).map(o=>`<div class="admin-order-card"><div class="order-top"><strong>${customerEscape(o.id)}</strong><span>${customerEscape(o.status||'Novo')}</span></div><div class="order-items">${(o.items||[]).map(i=>`${i.qty}x ${customerEscape(i.name)}`).join('<br>')}</div><div class="order-bottom"><small>${customerEscape(o.date)}</small><strong>${brl.format(Number(o.total)||0)}</strong></div></div>`).join('');
}
document.addEventListener('DOMContentLoaded',()=>{
  loadCustomerPanel();
  document.getElementById('customerLogout')?.addEventListener('click',()=>{vnClearCustomerSession();sessionStorage.removeItem('vnSmartCart');window.location.href='index.html';});
  document.getElementById('changeCustomerPhone')?.addEventListener('click',()=>{vnClearCustomerSession();sessionStorage.removeItem('vnSmartCart');window.location.href='index.html';});
});
