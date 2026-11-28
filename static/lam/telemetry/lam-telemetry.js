/*!
 * LAM Cookieless Web Telemetry & Dynamic Store Attribution (Consent Mode v2)
 * Measurement ID: G-0CBSTBHS88 (Property: lam-camera 536768531 / Stream: LAM Website 16294022298)
 *
 * Privacy invariants (enforced before gtag.js loads):
 *  1. Zero browser cookies (`analytics_storage: 'denied'`, `ad_storage: 'denied'`, `client_storage: 'none'`).
 *  2. Zero advertising / cross-site signals (`ad_user_data: 'denied'`, `ad_personalization: 'denied'`, `allow_google_signals: false`).
 *  3. Zero PII or user-uploaded image data ever transmitted; query strings on `/lam/r/` are stripped from `page_location`.
 *  4. Only loads network `gtag.js` on production `brewkits.dev` (or when `?debug_ga=1` is explicitly passed for verification).
 */
(function (window, document) {
  'use strict';

  var MEASUREMENT_ID = 'G-0CBSTBHS88';
  var host = (window.location && window.location.hostname) || '';
  var search = (window.location && window.location.search) || '';
  var isProdHost = host === 'brewkits.dev' || /\.brewkits\.dev$/i.test(host);
  var isDebugGa = /[?&]debug_ga=1(?:&|$)/.test(search);
  var shouldLoadNetworkTag = isProdHost || isDebugGa;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  // 1. Default Consent Mode v2 — strictly cookieless & ad-free BEFORE loading gtag.js
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted'
  });
  gtag('set', 'ads_data_redaction', true);
  gtag('set', 'url_passthrough', false);
  gtag('js', new Date());

  // Sanitize page_location on /lam/r/ so shared recipe codes in ?c= are not logged as raw URLs
  var cleanPath = (window.location && window.location.pathname) || '/lam/';
  var cleanOrigin = (window.location && window.location.origin && window.location.origin !== 'null')
    ? window.location.origin
    : 'https://brewkits.dev';
  var refGuide = '';
  try {
    var qp = new URLSearchParams(search);
    refGuide = (qp.get('from_guide') || '').replace(/[^a-z0-9_-]/gi, '').slice(0, 48);
  } catch (e) {}
  var cleanLocation = cleanOrigin + cleanPath + (refGuide ? ('?from_guide=' + refGuide) : '');

  gtag('config', MEASUREMENT_ID, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    client_storage: 'none',
    page_location: cleanLocation,
    page_path: cleanPath
  });

  if (shouldLoadNetworkTag) {
    var gs = document.createElement('script');
    gs.async = true;
    gs.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
    var firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(gs, firstScript);
    } else if (document.head) {
      document.head.appendChild(gs);
    }
  }

  function cleanToken(v, maxLen) {
    return String(v == null ? '' : v)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_+-]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, maxLen || 40);
  }

  var STATE = {
    sim_body: 'rangefinder',
    sim_film: 'kodak_400',
    sim_recipe: '',
    stu_theme: 'noir',
    stu_skin: 'slate_blue',
    last_feature: refGuide ? ('guide_' + refGuide) : 'initial',
    flags: {}
  };

  function buildUtmContent() {
    var lang = cleanToken(document.documentElement.lang || 'en', 8) || 'en';
    var base = STATE.last_feature || ('lang_' + lang);
    var suffix = [];
    if (STATE.flags.upload) suffix.push('up');
    if (STATE.flags.cube) suffix.push('cube');
    if (STATE.flags.copy) suffix.push('copy');
    if (STATE.flags.push) suffix.push('push');
    var full = base + (suffix.length ? ('_' + suffix.join('_')) : '') + '_' + lang;
    return full.slice(0, 64);
  }

  function enrichPlayHref(href, utmContent) {
    if (!href || href.indexOf('play.google.com/store/apps/details') === -1) return href;
    try {
      var u = new URL(href);
      var rawRef = u.searchParams.get('referrer') || 'utm_source=website&utm_medium=landing&utm_campaign=cta';
      var refParams = new URLSearchParams(rawRef);
      if (!refParams.get('utm_source')) refParams.set('utm_source', 'website');
      refParams.set('utm_content', utmContent);
      u.searchParams.set('referrer', refParams.toString());
      return u.toString();
    } catch (e) {
      return href;
    }
  }

  function refreshStoreLinks() {
    var content = buildUtmContent();
    var links = document.querySelectorAll('a[href*="play.google.com/store/apps/details"]');
    for (var i = 0; i < links.length; i++) {
      links[i].href = enrichPlayHref(links[i].href, content);
    }
  }

  function track(eventName, params) {
    if (!eventName) return;
    var payload = {
      page_section: cleanPath,
      ui_lang: cleanToken(document.documentElement.lang || 'en', 8) || 'en'
    };
    if (params) {
      for (var k in params) {
        if (Object.prototype.hasOwnProperty.call(params, k) && params[k] !== undefined && params[k] !== null) {
          payload[k] = params[k];
        }
      }
    }
    gtag('event', eventName, payload);
  }

  function updateContext(patch, featureLabel) {
    if (patch) {
      for (var k in patch) {
        if (Object.prototype.hasOwnProperty.call(patch, k) && patch[k] != null) {
          STATE[k] = cleanToken(patch[k], 32);
        }
      }
    }
    if (featureLabel) STATE.last_feature = cleanToken(featureLabel, 44);
    refreshStoreLinks();
  }

  function markFlag(flagName) {
    if (flagName) {
      STATE.flags[flagName] = true;
      refreshStoreLinks();
    }
  }

  function inferPlacement(anchor) {
    if (!anchor) return 'unknown';
    var href = anchor.getAttribute('href') || '';
    var mCt = href.match(/[?&]ct=([^&#]+)/);
    if (mCt && mCt[1]) return cleanToken(decodeURIComponent(mCt[1]).replace(/^website_/, ''), 32);
    try {
      var u = new URL(href, cleanOrigin);
      var ref = u.searchParams.get('referrer');
      if (ref) {
        var rp = new URLSearchParams(ref);
        var camp = rp.get('utm_campaign');
        var med = rp.get('utm_medium');
        if (camp) return cleanToken((med && med !== 'landing' ? med + '_' : '') + camp, 32);
      }
    } catch (e) {}
    if (anchor.id) return cleanToken(anchor.id, 32);
    var sec = anchor.closest('section[id], header, footer');
    if (sec) return cleanToken(sec.id || sec.tagName, 32);
    return 'cta';
  }

  // Which web price the visitor saw (28/11): the Black Friday window lives in /lam/promo.json and index.html exposes the
  // active one as window.activePromo(). 'none' outside a window or on pages without prices.
  function promoTag() {
    try {
      var p = typeof window.activePromo === 'function' ? window.activePromo() : null;
      return p ? cleanToken((p.label || 'sale') + '_' + (p.percent || ''), 32) : 'none';
    } catch (e) { return 'none'; }
  }

  function wireAutoEvents() {
    refreshStoreLinks();

    if (refGuide) {
      track('guide_referral_landing', { guide_slug: refGuide });
    }

    // Tag internal Guide -> /lam/ links with ?from_guide=<slug> (cookieless attribution across pages)
    if (cleanPath.indexOf('/lam/guides/') === 0) {
      var slug = cleanToken(cleanPath.replace(/^\/lam\/guides\/(?:en\/)?/, '').replace(/\.html$/, '') || 'index', 40);
      var isEnGuide = cleanPath.indexOf('/lam/guides/en/') === 0;
      track('guide_view', { guide_slug: slug, guide_lang: isEnGuide ? 'en' : 'vi' });
      var homeLinks = document.querySelectorAll('a[href="/lam/"], a[href="../"], a[href="../../"]');
      for (var i = 0; i < homeLinks.length; i++) {
        var hl = homeLinks[i];
        var rawH = hl.getAttribute('href') || '';
        if (rawH === '/lam/') {
          hl.setAttribute('href', '/lam/?from_guide=' + encodeURIComponent(slug));
        }
        hl.addEventListener('click', function () {
          track('guide_to_landing_click', { guide_slug: slug, transport_type: 'beacon' });
        });
      }
    }

    // Delegated Store Download CTA tracking (works across index, manual, guides, recipe share)
    function handleStoreClick(e) {
      if (e.type === 'auxclick' && e.button !== 1) return;
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      var href = a.href || '';
      var store = '';
      if (href.indexOf('apps.apple.com/app/id6773256954') !== -1) store = 'app_store';
      else if (href.indexOf('play.google.com/store/apps/details') !== -1 && href.indexOf('dev.brewkits.lam') !== -1) store = 'play_store';
      if (!store) return;

      if (store === 'play_store') {
        a.href = enrichPlayHref(href, buildUtmContent());
      }
      var placement = inferPlacement(a);
      track('click_download', {
        event_category: 'conversion',
        event_label: store + '_' + placement,
        store: store,
        placement: placement,
        utm_content: buildUtmContent(),
        sim_body: STATE.sim_body,
        sim_film: STATE.sim_film,
        sim_recipe: STATE.sim_recipe || 'custom',
        stu_theme: STATE.stu_theme,
        stu_skin: STATE.stu_skin,
        promo: promoTag(),
        transport_type: 'beacon'
      });
    }
    document.addEventListener('click', handleStoreClick, true);

    // Navigation clicks (28/11): in-page anchors (nav bar, pricing "see all" links) and links to the other LAM pages,
    // so the funnel shows WHAT a visitor read before a download click. Store links are handled above.
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      var raw = a.getAttribute('href') || '';
      if (raw.charAt(0) === '#') {
        var target = cleanToken(raw.slice(1), 32) || 'top';
        var from = a.closest('#stickyNav') ? 'nav' : (a.closest('section[id]') ? cleanToken(a.closest('section[id]').id, 24) : 'page');
        if (target === 'foodpack' || target === 'concertpack') updateContext(null, 'pack_' + target.replace('pack', ''));
        track('web_nav_click', { target: target, from: from });
        return;
      }
      var u;
      try { u = new URL(a.href, cleanOrigin); } catch (err) { return; }
      if (u.origin !== cleanOrigin && !/brewkits\.dev$/i.test(u.hostname)) return;
      if (u.pathname.indexOf('/lam/') !== 0) return;
      track('web_link_click', { target_path: u.pathname.slice(0, 80), transport_type: 'beacon' });
    }, true);
    document.addEventListener('auxclick', handleStoreClick, true);

    // Passive Scroll Depth Milestones (50% and 90%, once per page load)
    var fired50 = false, fired90 = false;
    window.addEventListener('scroll', function () {
      if (fired50 && fired90) return;
      var doc = document.documentElement;
      var scrollable = (doc.scrollHeight || 0) - (window.innerHeight || 0);
      if (scrollable <= 120) return;
      var pct = ((window.scrollY || window.pageYOffset || 0) / scrollable) * 100;
      if (!fired50 && pct >= 50) {
        fired50 = true;
        track('web_scroll_depth', { percent_scrolled: 50 });
      }
      if (!fired90 && pct >= 90) {
        fired90 = true;
        track('web_scroll_depth', { percent_scrolled: 90 });
      }
    }, { passive: true });

    // Section Visibility Funnel (Landing #sections & Manual .msec)
    if ('IntersectionObserver' in window) {
      var seenSections = {};
      var secIo = new IntersectionObserver(function (entries) {
        for (var j = 0; j < entries.length; j++) {
          var ent = entries[j];
          if (!ent.isIntersecting) continue;
          var sid = ent.target.id;
          if (sid && !seenSections[sid]) {
            seenSections[sid] = true;
            track('web_section_view', { section_id: cleanToken(sid, 32) });
            secIo.unobserve(ent.target);
          }
        }
      }, { threshold: 0.25 });
      var secs = document.querySelectorAll('section[id], .msec[id]');
      for (var s = 0; s < secs.length; s++) secIo.observe(secs[s]);
    }

    // FAQ <details> open tracking
    var faqItems = document.querySelectorAll('#faq details');
    for (var f = 0; f < faqItems.length; f++) {
      (function (det, idx) {
        det.addEventListener('toggle', function () {
          if (!det.open) return;
          var qSpan = det.querySelector('[data-i18n]');
          var qKey = qSpan ? qSpan.getAttribute('data-i18n') : ('faq_' + (idx + 1));
          track('faq_open', { faq_key: cleanToken(qKey, 24) });
        });
      })(faqItems[f], f);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireAutoEvents);
  } else {
    wireAutoEvents();
  }

  window.LamTelemetry = {
    track: track,
    updateContext: updateContext,
    markFlag: markFlag,
    refreshStoreLinks: refreshStoreLinks,
    state: STATE
  };
})(window, document);
