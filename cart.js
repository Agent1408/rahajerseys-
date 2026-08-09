/* ══════════════════════════════════════
   RAHA JERSEYS — SHARED CART LOGIC
═══════════════════════════════════════ */
var CART_KEY = 'raha_cart_v1';
var VERSION_PRICES = { 'Fan Version': 1200, 'Player Version': 1500, 'Retro Version': 2000, 'Limited Edition': 2500 };
var WA_ORDER_NUMBER = '254119485338'; // orders WhatsApp

/* ── STORAGE ── */
function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch (e) { return []; }
}
function saveCart(cart) {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
  updateCartBadge();
}

/* ── ADD / REMOVE ── */
function addToCart(item) {
  var cart = getCart();
  var freeCount = Math.floor(item.pieces / 5); // Buy 5, get 1 free
  var billablePieces = item.pieces - freeCount;
  item.lineTotal = (VERSION_PRICES[item.version] || 0) * billablePieces + (item.printing ? 400 * item.pieces : 0);
  cart.push(item);
  saveCart(cart);
  renderCartDrawer();
  showToast((String.fromCodePoint(0x2705)) + ' Added to cart: ' + item.team);
}
function removeFromCart(index) {
  var cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCartDrawer();
}

/* ── BADGE ── */
function updateCartBadge() {
  var cart = getCart();
  var count = cart.reduce(function (s, i) { return s + (i.pieces || 1); }, 0);
  document.querySelectorAll('.cart-badge').forEach(function (b) {
    b.textContent = count;
    b.style.display = count > 0 ? 'flex' : 'none';
  });
}

/* ── TOTALS ── */
function cartTotals() {
  var cart = getCart();
  var total = cart.reduce(function (s, i) { return s + i.lineTotal; }, 0);
  var deposit = Math.ceil(total * 0.30);
  var balance = total - deposit;
  return { total: total, deposit: deposit, balance: balance };
}

/* ── DRAWER ── */
function openCart() {
  renderCartDrawer();
  var ov = document.getElementById('cart-overlay');
  var dr = document.getElementById('cart-drawer');
  if (ov) ov.classList.add('open');
  if (dr) dr.classList.add('open');
}
function closeCart() {
  var ov = document.getElementById('cart-overlay');
  var dr = document.getElementById('cart-drawer');
  if (ov) ov.classList.remove('open');
  if (dr) dr.classList.remove('open');
}

function renderCartDrawer() {
  var wrap = document.getElementById('cart-items');
  var footer = document.getElementById('cart-footer');
  if (!wrap) return;
  var cart = getCart();

  if (cart.length === 0) {
    wrap.innerHTML = '<div class="cart-empty">' + String.fromCodePoint(0x1F6D2) + '<br><br>Your cart is empty.<br>Head to Products to add a jersey!</div>';
    if (footer) footer.style.display = 'none';
    updateCartBadge();
    return;
  }
  if (footer) footer.style.display = '';

  wrap.innerHTML = cart.map(function (item, idx) {
    var meta = [item.leagueLabel || item.categoryLabel, item.kitType, item.version, 'Size ' + item.size, item.pieces + ' pc' + (item.pieces > 1 ? 's' : '')].filter(Boolean).join(' · ');
    var freeCount = Math.floor(item.pieces / 5);
    if (freeCount > 0) meta += ' · ' + freeCount + ' free';
    if (item.printing) meta += ' · Print: ' + (item.printName || '') + ' ' + (item.printNumber || '');
    return '' +
      '<div class="cart-item">' +
        '<div class="cart-item-info">' +
          '<div class="cart-item-name">' + item.team + '</div>' +
          '<div class="cart-item-meta">' + meta + '</div>' +
          '<div class="cart-item-price">KSh ' + item.lineTotal.toLocaleString() + '</div>' +
        '</div>' +
        '<button class="cart-item-remove" onclick="removeFromCart(' + idx + ')">Remove</button>' +
      '</div>';
  }).join('');

  var t = cartTotals();
  var totalEl = document.getElementById('cart-total');
  var depositEl = document.getElementById('cart-deposit');
  var balanceEl = document.getElementById('cart-balance');
  if (totalEl) totalEl.textContent = 'KSh ' + t.total.toLocaleString();
  if (depositEl) depositEl.textContent = 'KSh ' + t.deposit.toLocaleString();
  if (balanceEl) balanceEl.textContent = 'KSh ' + t.balance.toLocaleString();
  updateCartBadge();
}

/* ── TOAST ── */
function showToast(msg) {
  var t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2200);
}

/* ── CHECKOUT VIA WHATSAPP ── */
function checkoutCart() {
  var nameEl = document.getElementById('checkout-name');
  var phoneEl = document.getElementById('checkout-phone');
  var name = nameEl ? nameEl.value.trim() : '';
  var phone = phoneEl ? phoneEl.value.trim() : '';

  if (!name || !phone) {
    showToast(String.fromCodePoint(0x26A0) + ' Please add your name & phone above the checkout button');
    if (nameEl) nameEl.classList.toggle('field-error', !name);
    if (phoneEl) phoneEl.classList.toggle('field-error', !phone);
    return;
  }

  var cart = getCart();
  if (cart.length === 0) { showToast('Your cart is empty'); return; }

  var BALL = String.fromCodePoint(0x26BD), PERSON = String.fromCodePoint(0x1F464),
      PHONEI = String.fromCodePoint(0x1F4F1), MONEY = String.fromCodePoint(0x1F4B0),
      CARD = String.fromCodePoint(0x1F4B3), PRAY = String.fromCodePoint(0x1F64F),
      CAM = String.fromCodePoint(0x1F4F8);

  var msg = BALL + ' *NEW ORDER - RAHA JERSEYS*\n\n';
  msg += PERSON + ' Name: ' + name + '\n';
  msg += PHONEI + ' Contact: ' + phone + '\n\n';
  msg += '*ITEMS (' + cart.length + '):*\n';
  cart.forEach(function (item, i) {
    msg += '\n' + (i + 1) + '. ' + item.team + (item.kitType ? ' (' + item.kitType + ')' : '') + '\n';
    msg += '    League/Cat: ' + (item.leagueLabel || item.categoryLabel || '-') + '\n';
    msg += '    Version: ' + item.version + '\n';
    msg += '    Size: ' + item.size + '  |  Pieces: ' + item.pieces + '\n';
    if (item.printing) msg += '    Printing: ' + (item.printName || '-') + ' #' + (item.printNumber || '-') + '\n';
    msg += '    Subtotal: KSh ' + item.lineTotal.toLocaleString() + '\n';
  });

  var t = cartTotals();
  msg += '\n' + MONEY + ' *PRICE BREAKDOWN*\n';
  msg += 'Total: *KSh ' + t.total.toLocaleString() + '*\n';
  msg += '30% Deposit: *KSh ' + t.deposit.toLocaleString() + '*\n';
  msg += 'Balance on delivery: *KSh ' + t.balance.toLocaleString() + '*\n';
  msg += '\n' + CARD + ' Send deposit via Pochi La Biashara:\n';
  msg += 'Number: *0710 611 244*\n';
  msg += 'Name: *ESTELLE KANG\u2019ETHE*\n';
  msg += 'Send M-Pesa screenshot as proof ' + CAM + '\n';
  msg += '\nPlease confirm my order. Asante! ' + PRAY;

  window.open('https://wa.me/' + WA_ORDER_NUMBER + '?text=' + encodeURIComponent(msg), '_blank');
  localStorage.removeItem(CART_KEY);
  renderCartDrawer();
  showToast(String.fromCodePoint(0x2705) + ' Order sent — cart cleared');
}

/* ── NAV HAMBURGER ── */
function toggleNav() {
  var el = document.getElementById('nav-links');
  if (el) el.classList.toggle('open');
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', function () {
  updateCartBadge();
  renderCartDrawer();
});
