(() => {
  'use strict';
  const products = window.DANDA_PRODUCTS || [];
  const key = 'danda-cart-v1';
  const money = value => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);
  const byId = id => products.find(product => product.id === id);
  const validQuantity = value => Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 99;
  let cart = [];
  let storageAvailable = true;
  function readCart() {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '[]');
      const merged = new Map();
      if (Array.isArray(data)) data.forEach(item => {
        if (item && byId(item.id) && validQuantity(item.quantity)) merged.set(item.id, Math.min(99, (merged.get(item.id) || 0) + Number(item.quantity)));
      });
      return [...merged].map(([id, quantity]) => ({ id, quantity }));
    } catch { storageAvailable = false; return []; }
  }
  cart = readCart();
  function announce(message) { const status = document.getElementById('shop-status'); if (status) status.textContent = message; }
  function save() {
    try { localStorage.setItem(key, JSON.stringify(cart)); }
    catch { storageAvailable = false; }
    render();
    if (!storageAvailable) announce('Browser storage is unavailable. Your cart will only stay on this page.');
  }
  function quantityControl(product, quantity, mode) {
    const control = document.createElement('div'); control.className = 'quantity-control';
    const minus = document.createElement('button'); minus.type = 'button'; minus.textContent = '−'; minus.setAttribute('aria-label', `Decrease ${product.name} quantity`);
    const input = document.createElement('input'); input.type = 'number'; input.min = '1'; input.max = '99'; input.step = '1'; input.value = quantity; input.setAttribute('aria-label', `${product.name} quantity in ${product.unit}`);
    const plus = document.createElement('button'); plus.type = 'button'; plus.textContent = '+'; plus.setAttribute('aria-label', `Increase ${product.name} quantity`);
    const update = value => {
      if (!validQuantity(value)) { input.value = mode === 'cart' ? cart.find(item => item.id === product.id)?.quantity || 1 : 1; announce('Choose a whole quantity from 1 to 99.'); return; }
      input.value = value;
      minus.disabled = Number(value) <= 1; plus.disabled = Number(value) >= 99;
      if (mode === 'cart') { cart.find(item => item.id === product.id).quantity = Number(value); save(); announce(`${product.name} quantity updated to ${value}.`); }
    };
    minus.disabled = quantity <= 1; plus.disabled = quantity >= 99;
    minus.addEventListener('click', () => update(Number(input.value) - 1));
    plus.addEventListener('click', () => update(Number(input.value) + 1));
    input.addEventListener('change', () => update(input.value));
    control.append(minus, input, plus); return control;
  }
  function summary() {
    return cart.reduce((result, item) => { const product = byId(item.id); if (product.price === null) result.pending = true; else result.total += product.price * item.quantity; return result; }, { total: 0, pending: false });
  }
  function render() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('[data-cart-count]').forEach(element => element.textContent = count);
    const list = document.getElementById('cart-items'); if (!list) return;
    const focus = document.activeElement;
    const focusId = focus?.closest('[data-item-id]')?.dataset.itemId;
    const focusLabel = focus?.getAttribute('aria-label');
    list.replaceChildren();
    cart.forEach(item => {
      const product = byId(item.id);
      const row = document.createElement('article'); row.className = 'cart-row'; row.dataset.itemId = product.id;
      const image = document.createElement('img'); image.src = product.image; image.alt = product.name;
      const details = document.createElement('div'); details.className = 'cart-details';
      const title = document.createElement('h2'); title.textContent = product.name;
      const price = document.createElement('p'); price.textContent = product.price === null ? 'Price to be confirmed' : `${money(product.price)} / ${product.unit}`;
      const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'remove-item'; remove.textContent = 'Remove'; remove.setAttribute('aria-label', `Remove ${product.name}`);
      remove.addEventListener('click', () => { cart = cart.filter(entry => entry.id !== product.id); save(); announce(`${product.name} removed.`); document.getElementById('cart-heading')?.focus(); });
      details.append(title, price, remove);
      const controls = document.createElement('div'); controls.className = 'cart-quantity'; controls.append(quantityControl(product, item.quantity, 'cart'));
      const unit = document.createElement('small'); unit.textContent = `Quantity (${product.unit})`; controls.append(unit);
      const total = document.createElement('strong'); total.className = 'line-total'; total.textContent = product.price === null ? 'Awaiting price' : money(product.price * item.quantity);
      row.append(image, details, controls, total); list.append(row);
    });
    if (focusId && focusLabel) [...list.querySelectorAll('[aria-label]')].find(element => element.closest('[data-item-id]').dataset.itemId === focusId && element.getAttribute('aria-label') === focusLabel)?.focus();
    const empty = cart.length === 0;
    document.getElementById('cart-empty').hidden = !empty;
    document.getElementById('checkout-section').hidden = empty;
    document.getElementById('order-summary').hidden = empty;
    const totals = summary();
    document.getElementById('subtotal-label').textContent = totals.pending ? 'Priced items subtotal' : 'Items subtotal';
    document.getElementById('cart-subtotal').textContent = money(totals.total);
    document.getElementById('price-note').textContent = totals.pending ? 'Some prices need confirmation. Delivery fees and the final total will be confirmed by our team.' : 'Delivery fees and the final total will be confirmed by our team.';
    document.getElementById('order-draft').hidden = true;
  }
  document.addEventListener('DOMContentLoaded', () => {
    const status = document.createElement('p'); status.id = 'shop-status'; status.className = 'shop-status'; status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); document.body.append(status);
    const nav = document.querySelector('.navbar-nav');
    if (nav) { const item = document.createElement('li'); item.className = 'nav-item'; item.innerHTML = '<a class="nav-link cart-nav" href="./Cart.html">Cart <span data-cart-count class="cart-badge">0</span></a>'; nav.append(item); }
    document.querySelectorAll('.product-card').forEach(card => {
      const name = card.querySelector('h4')?.textContent.trim().toLowerCase();
      const product = products.find(entry => entry.name.toLowerCase() === name); if (!product) return;
      const oldPrice = card.querySelector(':scope > p'); if (oldPrice) oldPrice.textContent = product.price === null ? 'Price to be confirmed' : `${money(product.price)} / ${product.unit}`;
      const shop = document.createElement('div'); shop.className = 'product-shop';
      const price = document.createElement('p'); price.className = 'shop-price'; price.textContent = product.price === null ? 'Price to be confirmed' : `${money(product.price)} / ${product.unit}`;
      const quantity = quantityControl(product, 1, 'product');
      const button = document.createElement('button'); button.type = 'button'; button.className = 'add-to-cart'; button.textContent = 'Add to cart';
      button.addEventListener('click', () => {
        const amount = Number(quantity.querySelector('input').value); if (!validQuantity(amount)) { announce('Choose a whole quantity from 1 to 99.'); return; }
        const existing = cart.find(item => item.id === product.id);
        if ((existing?.quantity || 0) + amount > 99) { announce('Maximum quantity is 99 per product. Adjust this item in your cart.'); return; }
        if (existing) existing.quantity += amount; else cart.push({ id: product.id, quantity: amount });
        save(); announce(`${amount} ${product.unit} of ${product.name} added to your cart.`);
      });
      if (!oldPrice) shop.append(price);
      const unit = document.createElement('small'); unit.textContent = `Quantity (${product.unit})`;
      const actions = document.createElement('div'); actions.className = 'product-shop-actions'; actions.append(quantity, button); shop.append(unit, actions);
      (card.querySelector('.product-content') || card).append(shop);
    });
    render();
    if (!storageAvailable) announce('Browser storage is unavailable. Your cart will only stay on this page.');
    const form = document.getElementById('checkout-form');
    if (form) form.addEventListener('submit', event => {
      event.preventDefault(); if (!form.reportValidity() || !cart.length) return;
      const data = new FormData(form);
      if (data.get('fulfilment') === 'delivery' && !String(data.get('address')).trim()) { document.getElementById('address').setCustomValidity('Enter your delivery address.'); document.getElementById('address').reportValidity(); return; }
      const totals = summary();
      const lines = ['Danda Farms order enquiry', '', ...cart.map(item => { const product = byId(item.id); return `${product.name}: ${item.quantity} ${product.unit} — ${product.price === null ? 'price to be confirmed' : money(product.price * item.quantity)}`; }), '', `${totals.pending ? 'Priced items subtotal' : 'Items subtotal'}: ${money(totals.total)}`, 'Final prices, availability and delivery fees require confirmation.', '', `Name: ${data.get('name')}`, `Email: ${data.get('email')}`, `Phone: ${data.get('phone')}`, `Fulfilment: ${data.get('fulfilment')}`, `Address: ${data.get('address') || 'Pickup at Ikorodu office'}`, `Notes: ${data.get('notes') || 'None'}`];
      const text = lines.join('\n');
      document.getElementById('order-text').textContent = text;
      document.getElementById('email-order').href = `mailto:globaldanda@gmail.com?subject=${encodeURIComponent('Danda Farms order enquiry')}&body=${encodeURIComponent(text)}`;
      const draft = document.getElementById('order-draft'); draft.hidden = false; draft.focus();
      document.getElementById('download-order').onclick = () => { const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = 'danda-order.txt'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
      announce('Your order draft is ready. Open your email app and send it to our team.');
    });
    const address = document.getElementById('address');
    address?.addEventListener('input', () => address.setCustomValidity(''));
    document.getElementById('fulfilment')?.addEventListener('change', event => { address.required = event.target.value === 'delivery'; address.setCustomValidity(''); });
    form?.addEventListener('input', () => { document.getElementById('order-draft').hidden = true; });
    window.addEventListener('storage', event => { if (event.key === key || event.key === null) { cart = readCart(); render(); } });
  });
})();