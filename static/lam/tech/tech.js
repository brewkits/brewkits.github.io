// LAM tech notes — shared script: VI/EN switch (?lang=vi|en, remembered per browser) and the
// table of contents built from the visible <h2 id> headings. Vietnamese is the default (brand rule: VI first).
(function () {
  var root = document.documentElement;
  var KEY = 'lam-tech-lang';

  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function remember(l) { try { localStorage.setItem(KEY, l); } catch (e) { /* private mode */ } }

  function pick() {
    var q = new URLSearchParams(location.search).get('lang');
    if (q === 'vi' || q === 'en') return q;
    var s = stored();
    return s === 'vi' || s === 'en' ? s : 'vi';
  }

  function buildToc(lang) {
    var list = document.querySelector('nav.toc ol');
    if (!list) return;
    list.textContent = '';
    document.querySelectorAll('main h2[id]').forEach(function (h) {
      var label = h.querySelector('[lang="' + lang + '"]') || h;
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = label.textContent.trim();
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  function apply(lang) {
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang);
    document.querySelectorAll('.langs button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });
    var t = document.querySelector('meta[name="lam-title-' + lang + '"]');
    if (t) document.title = t.content;
    buildToc(lang);
  }

  apply(pick());
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.langs button');
    if (!b) return;
    remember(b.dataset.lang);
    apply(b.dataset.lang);
    var u = new URL(location.href);
    u.searchParams.set('lang', b.dataset.lang);
    history.replaceState(null, '', u);
  });
})();
