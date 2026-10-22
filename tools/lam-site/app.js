/* ── 1.0.3 catalogue + copy (built by the site generator from the app's release sources) ── */
Object.keys(I18N_103).forEach(function (l) {
  I18N[l] = I18N[l] || {};
  Object.keys(I18N_103[l]).forEach(function (k) { I18N[l][k] = I18N_103[l][k]; });
});

var LAM_FILTER = 'all';
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function t(lang, k) { var d = I18N[lang] || {}; return d[k] != null ? d[k] : (I18N.en[k] || ''); }

function renderReel() {
  var reel = document.getElementById('reel');
  if (!reel || reel.childElementCount) return;
  var html = LAM_DATA.films.map(function (f) {
    return '<figure><img src="' + f.img + '" width="216" height="144" loading="lazy" alt=""><figcaption>' + esc(f.c) + '</figcaption></figure>';
  }).join('');
  reel.innerHTML = html + html; // doubled so the -50% loop is seamless
}

function renderFilms(lang) {
  var grid = document.getElementById('films-grid');
  if (!grid) return;
  var shown = LAM_DATA.films.filter(function (f) {
    return LAM_FILTER === 'all' || (LAM_FILTER === 'free' && !f.p) || (LAM_FILTER === 'bw' && f.m) || (LAM_FILTER === 'colour' && !f.m);
  });
  grid.innerHTML = shown.map(function (f) {
    var s = f.s[lang] || f.s.en;
    return '<article class="film"><div class="ph"><img src="' + f.img + '" width="640" height="426" loading="lazy" alt="' + esc(f.n) + '">' +
      '<span class="code">' + esc(f.c) + '</span><span class="badge ' + (f.p ? 'pro">' + esc(t(lang, 'proBadge')) : 'free">' + esc(t(lang, 'freeBadge'))) + '</span></div>' +
      '<div class="bd"><h3>' + esc(f.n) + '</h3><p class="vibe">' + esc(s[0]) + '</p><div class="best"><b>' + esc(t(lang, 'fBest')) + '</b>' + esc(s[1]) + '</div></div></article>';
  }).join('');
}

function renderBodies(lang) {
  var box = document.getElementById('decades');
  if (!box) return;
  var order = [], groups = {};
  LAM_DATA.bodies.forEach(function (b) { if (!groups[b.d]) { groups[b.d] = []; order.push(b.d); } groups[b.d].push(b); });
  box.innerHTML = order.map(function (d) {
    return '<div class="decade rv in"><div class="yr">' + esc(d) + '</div><div class="row">' + groups[d].map(function (b) {
      return '<article class="body" style="--h:' + b.h + '"><span class="lens"></span>' +
        '<span class="badge ' + (b.p ? 'pro">' + esc(t(lang, 'proBadge')) : 'free">' + esc(t(lang, 'freeBadge'))) + '</span>' +
        '<div class="nm">' + esc(b.n) + '</div><div class="tg">' + esc(b.t[lang] || b.t.en) + '</div>' +
        '<div class="ld"><b>' + esc(t(lang, 'bLoads')) + '</b>' + esc(b.f) + '</div></article>';
    }).join('') + '</div></div>';
  }).join('');
}

function labelTables() {
  document.querySelectorAll('.tbl').forEach(function (tbl) {
    var heads = Array.prototype.map.call(tbl.querySelectorAll('.tr.th span'), function (s) { return s.textContent; });
    tbl.querySelectorAll('.tr:not(.th)').forEach(function (row) {
      Array.prototype.forEach.call(row.children, function (cell, i) { if (heads[i]) cell.setAttribute('data-h', heads[i]); });
    });
  });
}

var applyLangBase = applyLang;
applyLang = function (lang) {
  applyLangBase(lang);
  var cur = I18N[lang] ? lang : 'en';
  renderFilms(cur);
  renderBodies(cur);
  labelTables();
};

(function () {
  // Hidden-until-revealed only when this script runs: without JS every section stays readable.
  document.documentElement.classList.add('js');
  renderReel();
  var chips = document.getElementById('filmChips');
  if (chips) chips.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-f]');
    if (!b) return;
    LAM_FILTER = b.getAttribute('data-f');
    chips.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
    renderFilms(document.documentElement.lang || 'en');
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('in'); });
  }
})();
