/* ══════════════════════════════════════
   RAHA JERSEYS — QUICK ADD MODAL
═══════════════════════════════════════ */
var _quickAddCtx = null;

function openQuickAdd(cfg) {
  _quickAddCtx = cfg;
  document.getElementById('qa-img').src = cfg.img || 'https://placehold.co/200x266/0d5c2e/f5c518?text=Jersey';
  document.getElementById('qa-team').textContent = cfg.team;
  document.getElementById('qa-sub').textContent = cfg.subLabel || '';

  var kitWrap = document.getElementById('qa-kit-wrap');
  var kitSel = document.getElementById('qa-kit');
  if (cfg.hasKitType) {
    kitWrap.style.display = '';
    kitSel.innerHTML = '<option value="Home">Home</option><option value="Away">Away</option>';
  } else {
    kitWrap.style.display = 'none';
  }

  var verSel = document.getElementById('qa-version');
  verSel.innerHTML = '';
  (cfg.versions || ['Pro']).forEach(function (v) {
    var o = document.createElement('option');
    o.value = v;
    o.textContent = v + ' \u2013 KSh ' + (VERSION_PRICES[v] || 0).toLocaleString();
    verSel.appendChild(o);
  });

  document.getElementById('qa-size').value = '';
  document.getElementById('qa-pieces').value = '1';
  document.getElementById('qa-print').value = 'no';
  document.getElementById('qa-print-name').value = '';
  document.getElementById('qa-print-number').value = '';
  onQaPrintChange();
  updateQaPricePreview();

  document.getElementById('qa-overlay').classList.add('open');
}

function closeQuickAdd() {
  document.getElementById('qa-overlay').classList.remove('open');
}

function onQaPrintChange() {
  var yes = document.getElementById('qa-print').value === 'yes';
  document.getElementById('qa-print-details').style.display = yes ? '' : 'none';
  updateQaPricePreview();
}

function updateQaPricePreview() {
  var version = document.getElementById('qa-version').value;
  var pieces = parseInt(document.getElementById('qa-pieces').value) || 1;
  var printing = document.getElementById('qa-print').value === 'yes';
  var total = (VERSION_PRICES[version] || 0) * pieces + (printing ? 300 * pieces : 0);
  document.getElementById('qa-price-preview').textContent = 'KSh ' + total.toLocaleString() + ' total \u00b7 KSh ' + Math.ceil(total * 0.3).toLocaleString() + ' deposit (30%)';
}

function submitQuickAdd() {
  var size = document.getElementById('qa-size').value;
  if (!size) {
    document.getElementById('qa-size').classList.add('field-error');
    showToast(String.fromCodePoint(0x26A0) + ' Please pick a size');
    return;
  }
  document.getElementById('qa-size').classList.remove('field-error');

  var cfg = _quickAddCtx || {};
  var item = {
    team: cfg.team,
    kitType: cfg.hasKitType ? document.getElementById('qa-kit').value : '',
    leagueLabel: cfg.subLabel,
    categoryLabel: cfg.subLabel,
    version: document.getElementById('qa-version').value,
    size: size,
    pieces: parseInt(document.getElementById('qa-pieces').value) || 1,
    printing: document.getElementById('qa-print').value === 'yes',
    printName: document.getElementById('qa-print-name').value.trim(),
    printNumber: document.getElementById('qa-print-number').value.trim()
  };
  addToCart(item);
  closeQuickAdd();
}

document.addEventListener('change', function (e) {
  if (['qa-version', 'qa-pieces', 'qa-print'].indexOf(e.target.id) !== -1) updateQaPricePreview();
});
