/*
 * LAM Runtime Film Grading Engine (WebGL + Canvas2D Fallback)
 * Single-source port of:
 *   - LamColorGrade.kt (all 31 FilmStocks, golden checksum 484733)
 *   - FilmShader.kt (33^3 trilinear LUT, True Skin v2 pull + chroma gate, Look C HaloField halation,
 *                    unsharp mask, LightLeakStyle, Kelvin WB, ToneCurveDNA, dual-octave photochemical grain, cos^4 vignette)
 *   - CameraBody.kt + GrainSlider.kt + SkinToneMode.kt + LutExporter.kt
 *   - RecipeCodec.kt (40-bit v2/v1 Base36 8-character code with XOR-folded byte checksum)
 */
(function (root) {
  'use strict';

  var F = Math.fround;

  // ── 1. Catalogue: All 31 FilmStocks (exact stableId, grainIntensity, halationIntensity, defaultLightLeak, boxIso & pushable per RollPush.kt) ──
  var STOCKS = [
    { key: 'KODAK_400',       name: 'Gold 400',       code: 'GLD400', pro: false, grain: 0.0475, stableId: 0,  leak: 'NONE',        hal: 1.10, mono: false, iso: 400,  pushable: true  },
    { key: 'FUJI_400H',       name: 'Pastel 400',     code: 'PST400', pro: false, grain: 0.0350, stableId: 1,  leak: 'NONE',        hal: 0.85, mono: false, iso: 400,  pushable: true  },
    { key: 'ILFORD_HP5',      name: 'Silver 400',     code: 'SLV400', pro: false, grain: 0.0550, stableId: 2,  leak: 'NONE',        hal: 0.00, mono: true,  iso: 400,  pushable: true  },
    { key: 'CINEMA_800',      name: 'Cinema 800T',    code: 'C800T',  pro: true,  grain: 0.0600, stableId: 3,  leak: 'EDGE_COOL',   hal: 1.60, mono: false, iso: 800,  pushable: true  },
    { key: 'PORTRA_800',      name: 'Portia 800',     code: 'PTA800', pro: true,  grain: 0.0500, stableId: 4,  leak: 'NONE',        hal: 0.85, mono: false, iso: 800,  pushable: true  },
    { key: 'PORTRA_160',      name: 'Portia 160',     code: 'PTA160', pro: true,  grain: 0.0250, stableId: 5,  leak: 'NONE',        hal: 0.85, mono: false, iso: 160,  pushable: true  },
    { key: 'AGFA_ULTRA',      name: 'Ultra 50',       code: 'ULT50',  pro: true,  grain: 0.0250, stableId: 6,  leak: 'NONE',        hal: 0.85, mono: false, iso: 50,   pushable: true  },
    { key: 'FUJI_VELVIA',     name: 'Velvet 50',      code: 'VLV50',  pro: true,  grain: 0.0200, stableId: 7,  leak: 'NONE',        hal: 0.85, mono: false, iso: 50,   pushable: true  },
    { key: 'CCD_2000',        name: 'CCD 2000',       code: 'CCD2K',  pro: false, grain: 0.0150, stableId: 8,  leak: 'NONE',        hal: 0.00, mono: false, iso: null, pushable: false },
    { key: 'CCD_PINK',        name: 'CCD Pink',       code: 'CCDPNK', pro: false, grain: 0.0120, stableId: 9,  leak: 'NONE',        hal: 0.00, mono: false, iso: null, pushable: false },
    { key: 'DISPOSABLE',      name: 'Disposable',     code: 'DISP',   pro: false, grain: 0.0650, stableId: 10, leak: 'CORNER_WARM', hal: 1.10, mono: false, iso: null, pushable: false },
    { key: 'SUPER8',          name: 'Super 8',        code: 'SUP8',   pro: true,  grain: 0.0750, stableId: 11, leak: 'CENTER_BURN', hal: 0.85, mono: false, iso: null, pushable: true  },
    { key: 'KODAK_GOLD_200',  name: 'Gold 200',       code: 'GLD200', pro: false, grain: 0.0450, stableId: 12, leak: 'NONE',        hal: 1.10, mono: false, iso: 200,  pushable: true  },
    { key: 'KODAK_250D',      name: 'Cine 250D',      code: 'C250D',  pro: true,  grain: 0.0220, stableId: 13, leak: 'NONE',        hal: 0.85, mono: false, iso: 250,  pushable: true  },
    { key: 'FUJI_ETERNA_160', name: 'Eternal 160',    code: 'ETN160', pro: true,  grain: 0.0200, stableId: 14, leak: 'NONE',        hal: 0.85, mono: false, iso: 160,  pushable: true  },
    { key: 'KODACHROME_64',   name: 'Colorchrome 64', code: 'CCH64',  pro: true,  grain: 0.0180, stableId: 15, leak: 'NONE',        hal: 0.35, mono: false, iso: 64,   pushable: true  },
    { key: 'MINI_INSTANT',    name: 'Mini Instant',   code: 'MINI',   pro: false, grain: 0.0300, stableId: 16, leak: 'NONE',        hal: 1.00, mono: false, iso: null, pushable: false },
    { key: 'TROPIC_200',      name: 'Tropic 200',     code: 'TRP200', pro: false, grain: 0.0400, stableId: 17, leak: 'NONE',        hal: 1.10, mono: false, iso: 200,  pushable: true  },
    { key: 'NIGHT_500T',      name: 'Night 500T',     code: 'N500T',  pro: false, grain: 0.0350, stableId: 18, leak: 'NONE',        hal: 0.50, mono: false, iso: 500,  pushable: true  },
    { key: 'GRIT_400',        name: 'Grit 400',       code: 'GRT400', pro: true,  grain: 0.0500, stableId: 19, leak: 'NONE',        hal: 0.00, mono: true,  iso: 400,  pushable: true  },
    { key: 'SQUARE_600',      name: 'Square 600',     code: 'SQ600',  pro: true,  grain: 0.0150, stableId: 20, leak: 'NONE',        hal: 0.50, mono: false, iso: null, pushable: false },
    { key: 'FADED_72',        name: 'Faded 72',       code: 'FDD72',  pro: true,  grain: 0.0450, stableId: 21, leak: 'NONE',        hal: 1.10, mono: false, iso: 100,  pushable: true  },
    { key: 'ERA_36',          name: 'Era 36',         code: 'ERA36',  pro: true,  grain: 0.0400, stableId: 22, leak: 'NONE',        hal: 1.20, mono: false, iso: null, pushable: true  },
    { key: 'MONO_125',        name: 'Mono 125',       code: 'MON125', pro: true,  grain: 0.0300, stableId: 23, leak: 'NONE',        hal: 0.00, mono: true,  iso: 125,  pushable: true  },
    { key: 'AZURE_100',       name: 'Azure 100',      code: 'AZR100', pro: true,  grain: 0.0200, stableId: 24, leak: 'NONE',        hal: 0.85, mono: false, iso: 100,  pushable: true  },
    { key: 'PURE_100',        name: 'Pure 100',       code: 'PUR100', pro: true,  grain: 0.0180, stableId: 25, leak: 'NONE',        hal: 0.85, mono: false, iso: 100,  pushable: true  },
    { key: 'DAILY_200',       name: 'Daily 200',      code: 'DLY200', pro: true,  grain: 0.0450, stableId: 26, leak: 'NONE',        hal: 1.10, mono: false, iso: 200,  pushable: true  },
    { key: 'PUNCH_100',       name: 'Punch 100',      code: 'PNC100', pro: false, grain: 0.0400, stableId: 27, leak: 'NONE',        hal: 1.00, mono: false, iso: 100,  pushable: true  },
    { key: 'CRISP_100',       name: 'Crisp 100',      code: 'CRS100', pro: true,  grain: 0.0180, stableId: 28, leak: 'NONE',        hal: 0.85, mono: false, iso: 100,  pushable: true  },
    { key: 'INFRA',           name: 'Infra',          code: 'INFRA',  pro: true,  grain: 0.0500, stableId: 29, leak: 'NONE',        hal: 1.00, mono: false, iso: null, pushable: false },
    { key: 'RISE_200',        name: 'Rise 200',       code: 'RSE200', pro: true,  grain: 0.0550, stableId: 30, leak: 'NONE',        hal: 1.40, mono: false, iso: 200,  pushable: true  }
  ];

  // "One shooting day" curated order (CameraUiState.kt 2026-11-25)
  var CURATED_KEYS = [
    'KODAK_400', 'KODAK_GOLD_200', 'FUJI_400H', 'TROPIC_200', 'NIGHT_500T',
    'CINEMA_800', 'KODAK_250D', 'FUJI_ETERNA_160', 'PORTRA_160', 'PORTRA_800',
    'FUJI_VELVIA', 'AGFA_ULTRA', 'KODACHROME_64', 'AZURE_100', 'PURE_100',
    'CRISP_100', 'DAILY_200', 'RISE_200', 'MINI_INSTANT', 'SQUARE_600',
    'CCD_2000', 'CCD_PINK', 'DISPOSABLE', 'PUNCH_100', 'FADED_72',
    'ERA_36', 'SUPER8', 'INFRA', 'ILFORD_HP5', 'MONO_125', 'GRIT_400'
  ];

  var STOCK_BY_KEY = {};
  var STOCK_BY_ID = {};
  STOCKS.forEach(function (s, idx) {
    s.ordinal = idx;
    STOCK_BY_KEY[s.key] = s;
    STOCK_BY_ID[s.stableId] = s;
  });

  // SkinToneMode.kt (exact stableIds & Rec.601 YCbCr preferred-skin targets)
  var SKINS = [
    { key: 'WARM_SEA',     label: 'Warm SEA',     stableId: 1, ordinal: 2, sw: '#E8C9A8', targetCb: -0.1474, targetCr: 0.1633, pullStrength: 0.35 },
    { key: 'GOLDEN_HOUR',  label: 'Golden Hour',  stableId: 3, ordinal: 4, sw: '#D9B889', targetCb: -0.1688, targetCr: 0.1734, pullStrength: 0.35 },
    { key: 'NEUTRAL',      label: 'Neutral',      stableId: 0, ordinal: 1, sw: '#D7C2A8', targetCb:  0.0,    targetCr: 0.0,    pullStrength: 0.0  },
    { key: 'COOL_NEUTRAL', label: 'Cool Neutral', stableId: 2, ordinal: 3, sw: '#EAD9C8', targetCb: -0.1205, targetCr: 0.1475, pullStrength: 0.35 },
    { key: 'AUTO',         label: 'AUTO',         stableId: 4, ordinal: 0, sw: 'conic-gradient(#E8C9A8,#D9B889,#EAD9C8,#E8C9A8)', targetCb: 0.0, targetCr: 0.0, pullStrength: 0.0 }
  ];
  var SKIN_BY_KEY = {};
  var SKIN_BY_ID = {};
  var SKIN_BY_ORDINAL = {};
  SKINS.forEach(function (sk) {
    SKIN_BY_KEY[sk.key] = sk;
    SKIN_BY_ID[sk.stableId] = sk;
    SKIN_BY_ORDINAL[sk.ordinal] = sk;
  });

  // FrameStyle.kt
  var FRAMES = [
    { key: 'NONE',         name: 'None',           stableId: 0 },
    { key: 'THIN',         name: 'Film Border',    stableId: 1 },
    { key: 'KODAK_BORDER', name: 'Yellow Border',  stableId: 2 },
    { key: 'POLAROID',     name: 'Instant Border', stableId: 3 }
  ];
  var FRAME_BY_KEY = {};
  var FRAME_BY_ID = {};
  FRAMES.forEach(function (fr) { FRAME_BY_KEY[fr.key] = fr; FRAME_BY_ID[fr.stableId] = fr; });

  // CameraBody.kt (8 representative bodies with exact optics, defaultStock, defaultSkin, grainFormatScale)
  var BODIES = [
    { id: 'LAM_CLASSIC',    name: 'LAM Classic',  fmt: '35mm · 3:4',    pro: false, roll: 36, vig: 0.35, hal: 0.08, grainScale: 1.0, stamp: false, frame: 'NONE',         defStock: 'KODAK_400',    defSkin: 'NEUTRAL',      hud: 'LAM CLASSIC · 35MM',
      diffEn: '35mm rangefinder: 0.35 cos⁴ vignette (×0.6 render), 0.08 base halation, 1.0× grain scale.',
      diffVi: 'Rangefinder 35mm: tối góc cos⁴ 0.35, halation nền 0.08, hệ số hạt chuẩn 1.0×.' },
    { id: 'LAM_DONG_DUONG', name: 'Saigon',       fmt: 'Tropical 35mm', pro: false, roll: 36, vig: 0.32, hal: 0.22, grainScale: 1.0, stamp: false, frame: 'THIN',         defStock: 'TROPIC_200',   defSkin: 'WARM_SEA',     hud: 'SAIGON · TROPICAL 35MM',
      diffEn: '90s SEA compact: warmer 0.22 tropical halation + 0.32 vignette, paired with Tropic 200 & Warm SEA.',
      diffVi: 'Máy compact Sài Gòn thập niên 90: halation nắng nhiệt đới 0.22 + tối góc 0.32, đi cùng Tropic 200 & Warm SEA.' },
    { id: 'INSTANT_MINI',   name: 'Pocket Instant', fmt: 'Instant Print', pro: false, roll: 10, vig: 0.35, hal: 0.15, grainScale: 1.0, stamp: false, frame: 'POLAROID',     defStock: 'MINI_INSTANT', defSkin: 'WARM_SEA',     hud: 'POCKET INSTANT · 62×46MM',
      diffEn: 'Instant print card frame, 0.15 emulsion halation, 0.35 60mm lens falloff & 10-pack counter.',
      diffVi: 'Khung giấy in lấy liền, halation nhũ tương 0.15, tối góc ống 60mm (0.35) & hộp 10 tấm.' },
    { id: 'LAM_CCD',        name: 'CCD Digicam',  fmt: 'Y2K Sensor',    pro: false, roll: 99, vig: 0.15, hal: 0.00, grainScale: 1.0, stamp: false, frame: 'NONE',         defStock: 'CCD_2000',     defSkin: 'COOL_NEUTRAL', hud: 'CCD DIGICAM · 2003',
      diffEn: '2003 digital CCD sensor: flat 0.15 lens field and 0.00 film halation (no film base to scatter light).',
      diffVi: 'Cảm biến CCD kỹ thuật số 2003: tối góc rất phẳng (0.15) và halation = 0 (không có đế phim phản xạ).' },
    { id: 'DISPOSABLE',     name: 'Disposable',   fmt: '90s Stamp',     pro: false, roll: 27, vig: 0.43, hal: 0.15, grainScale: 1.0, stamp: true,  frame: 'KODAK_BORDER', defStock: 'DISPOSABLE',   defSkin: 'WARM_SEA',     hud: 'DISPOSABLE · 27 EXP',
      diffEn: 'Single-use 30mm f/10 plastic lens: 0.43 vignette, 0.15 halation, quartz date stamp & 27-shot roll.',
      diffVi: 'Ống nhựa 30mm f/10 dùng một lần: tối góc 0.43, halation 0.15, đóng dấu ngày tháng & cuộn 27 kiểu.' },
    { id: 'PHOTOBOOTH',     name: 'Photobooth',   fmt: '4-Pose Strip',  pro: false, roll: 4,  vig: 0.15, hal: 0.00, grainScale: 1.0, stamp: false, frame: 'NONE',         defStock: 'ILFORD_HP5',   defSkin: 'NEUTRAL',      hud: 'PHOTOBOOTH · 4-STRIP',
      diffEn: '1960s chemical 4-pose booth strip: 1:1 framing, minimal 0.15 vignette, zero halation.',
      diffVi: 'Buồng chụp tự động 4 tấm liên tiếp thập niên 60: tối góc nhẹ 0.15, không halation.' },
    { id: 'HALF_FRAME',     name: 'Half Frame',   fmt: 'Diptych · 1.4×', pro: true, roll: 72, vig: 0.30, hal: 0.08, grainScale: 1.4, stamp: false, frame: 'NONE',         defStock: 'GRIT_400',     defSkin: 'NEUTRAL',      hud: 'HALF FRAME · 72 EXP',
      diffEn: '18×24mm half-frame diptych: doubles roll to 72 shots and enlarges grain structure by 1.4×.',
      diffVi: 'Khung đôi Half-frame 18×24mm: nhân đôi cuộn phim lên 72 kiểu và phóng đại biên độ hạt 1.4×.' },
    { id: 'CINE_16MM',      name: '16mm Cine',    fmt: '16:9 · 1.6×',   pro: true,  roll: 36, vig: 0.50, hal: 0.40, grainScale: 1.6, stamp: false, frame: 'THIN',         defStock: 'KODAK_250D',   defSkin: 'GOLDEN_HOUR',  hud: '16MM CINE · 24 FPS',
      diffEn: '16mm arthouse cinema gate: 0.50 Bolex vignette, strong 0.40 halation, 1.6× format grain & 24fps weave.',
      diffVi: 'Cửa phim điện ảnh 16mm: tối góc sâu 0.50, halation mạnh 0.40, hệ số hạt khổ nhỏ 1.6× & rung 24fps.' }
  ];

  // ── 2. Exact Single-Source LamColorGrade.kt Port (32-bit Float via Math.fround) ──
  function c01(x) {
    var v = F(x);
    return v < 0 ? 0 : (v > 1 ? 1 : v);
  }
  function max2(a, b) { return a > b ? a : b; }
  function min2(a, b) { return a < b ? a : b; }
  function max3(a, b, c) { return max2(a, max2(b, c)); }
  function min3(a, b, c) { return min2(a, min2(b, c)); }

  function luma601(r, g, b) {
    return F(F(F(0.299) * F(r)) + F(F(0.587) * F(g)) + F(F(0.114) * F(b)));
  }
  function luma709(r, g, b) {
    return F(F(F(0.2126) * F(r)) + F(F(0.7152) * F(g)) + F(F(0.0722) * F(b)));
  }
  function mix(a, b, t) {
    return F(F(a) + F(F(F(b) - F(a)) * F(t)));
  }
  function smoothstep(e0, e1, x) {
    var t = F(F(F(x) - F(e0)) / F(F(e1) - F(e0)));
    if (t < 0) t = 0; else if (t > 1) t = 1;
    return F(F(t * t) * F(F(3) - F(F(2) * t)));
  }
  function sCurve(x0, contrast, bias) {
    var xin = F(F(x0) + F(bias));
    if (xin < 0) xin = 0;
    var x = xin > 1 ? 1 : xin;
    var shaped = F(x + F(F(F(contrast) * x) * F(F(1 - x) * F(x - F(0.5)))));
    var res = F(shaped + F(xin - x));
    return res < 0 ? 0 : res;
  }
  function softClip(x, start) {
    var s = F(start);
    if (s < F(0.5)) s = F(0.5); else if (s > F(0.98)) s = F(0.98);
    var xf = F(x);
    if (xf <= s) return xf;
    var excess = F(xf - s);
    var range = F(1 - s);
    return F(s + F(range * F(1 - F(Math.exp(F(-excess / range))))));
  }
  function characteristicCurve(x, toe, contrast, shoulderStart) {
    var xc = F(x);
    if (xc < 0) xc = 0;
    var tc = F(toe || 0);
    if (tc < 0) tc = 0; else if (tc > F(0.2)) tc = F(0.2);
    var toed = F(xc + F(tc * F(1 - smoothstep(0, F(0.3), xc))));
    var pivot = F(0.45);
    var lined = F(pivot + F(F(toed - pivot) * F(contrast === undefined ? 1 : contrast)));
    if (lined < 0) lined = 0;
    return c01(softClip(lined, shoulderStart === undefined ? F(0.9) : F(shoulderStart)));
  }
  function rgb2hsv(r, g, b) {
    r = F(r); g = F(g); b = F(b);
    var mx = max3(r, g, b);
    var mn = min3(r, g, b);
    var d = F(mx - mn);
    var v = mx;
    var s = mx <= 0 ? 0 : F(d / mx);
    var h = 0;
    if (d > F(1e-10)) {
      if (mx === r) h = F(F(F(g - b) / d) + (g < b ? 6 : 0));
      else if (mx === g) h = F(F(F(b - r) / d) + 2);
      else h = F(F(F(r - g) / d) + 4);
      h = F(h / 6);
    }
    return [h, s, v];
  }
  function hsv2rgb(h, s, v) {
    h = F(h); s = F(s); v = F(v);
    if (s <= 0) return [v, v, v];
    var hf = F(F(h - F(Math.floor(h))) * 6);
    var i = hf | 0;
    var f = F(hf - i);
    var p = F(v * F(1 - s));
    var q = F(v * F(1 - F(f * s)));
    var t = F(v * F(1 - F(F(1 - f) * s)));
    switch (i % 6) {
      case 0: return [v, t, p];
      case 1: return [q, v, p];
      case 2: return [p, v, t];
      case 3: return [p, q, v];
      case 4: return [t, p, v];
      default: return [v, p, q];
    }
  }
  function hueGrade(r, g, b, huePeak, hueWidth, satBoost, warmth) {
    var hsv = rgb2hsv(r, g, b);
    var h = hsv[0], s = hsv[1], v = hsv[2];
    var dh = F(Math.abs(F(h - F(huePeak))));
    dh = min2(dh, F(1 - dh));
    var w = F(1 - smoothstep(0, F(hueWidth), dh));
    w = F(w * smoothstep(F(0.05), F(0.20), s));
    var s2 = c01(F(s * F(1 + F(F(satBoost) * w))));
    var h2 = F(h + F(F(warmth) * w));
    h2 = F(h2 - F(Math.floor(h2)));
    return hsv2rgb(h2, s2, v);
  }
  function applyToneCurveDna(r, g, b, shadowLift, highlightRolloff) {
    shadowLift = F(shadowLift || 0);
    highlightRolloff = F(highlightRolloff || 0);
    if (shadowLift === 0 && highlightRolloff === 0) return [F(r), F(g), F(b)];
    var lift = Math.max(0, Math.min(F(0.15), shadowLift));
    var rolloff = Math.max(0, Math.min(F(0.15), highlightRolloff));
    var shoulderStart = F(Math.max(F(0.5), Math.min(F(0.9), F(F(0.9) - rolloff))));
    function ch(x) {
      x = F(x);
      var lifted = F(x + F(lift * F(1 - smoothstep(0, F(0.3), x))));
      return c01(softClip(lifted, shoulderStart));
    }
    return [ch(r), ch(g), ch(b)];
  }

  var DATA_CURVES = {
    MINI_INSTANT: {
      floor: [0.01, 0.012, 0.014], gain: [0.98, 1.02, 1.02], offset: [0, 0.006, 0.012],
      toe: [0.01, 0.015, 0.02], contrast: [1.28, 1.26, 1.22], shoulder: [0.78, 0.80, 0.80],
      shadowTint: [-0.012, 0.006, 0.010], highlightTint: [0, 0, 0],
      saturation: 1.12, hues: [[0.30, 0.10, 0.15, 0]]
    },
    TROPIC_200: {
      floor: [0.012, 0.012, 0.012], gain: [1.02, 0.99, 0.99], offset: [0.008, 0.002, 0.004],
      toe: [0.045, 0.05, 0.05], contrast: [1.14, 1.16, 1.12], shoulder: [0.87, 0.88, 0.89],
      shadowTint: [-0.010, 0.010, 0.008], highlightTint: [0.004, -0.002, 0],
      saturation: 0.98, hues: [[0.31, 0.12, -0.12, 0.14], [0.03, 0.06, 0.30, -0.006]]
    },
    NIGHT_500T: {
      floor: [0.008, 0.010, 0.014], gain: [0.93, 0.99, 1.06], offset: [0, 0, 0.006],
      toe: [0.03, 0.035, 0.045], contrast: [1.02, 1.02, 1.0], shoulder: [0.92, 0.92, 0.93],
      shadowTint: [-0.006, 0, 0.012], highlightTint: [0, 0.004, 0.008],
      saturation: 0.94, hues: []
    },
    FUJI_ETERNA_160: {
      floor: [0.012, 0.013, 0.015], gain: [0.98, 1.0, 1.0], offset: [0.004, 0.006, 0.008],
      toe: [0.06, 0.065, 0.065], contrast: [0.98, 0.98, 0.97], shoulder: [0.88, 0.88, 0.89],
      shadowTint: [-0.008, 0.004, 0.006], highlightTint: [-0.006, 0.002, 0.004],
      saturation: 0.80, hues: []
    },
    SQUARE_600: {
      floor: [0.012, 0.016, 0.012], gain: [1.0, 0.99, 0.96], offset: [0.012, 0.012, 0.008],
      toe: [0.05, 0.06, 0.05], contrast: [1.04, 1.02, 1.0], shoulder: [0.84, 0.85, 0.86],
      shadowTint: [-0.026, 0.024, 0], highlightTint: [0.036, -0.010, 0.008],
      saturation: 0.92, hues: []
    },
    FADED_72: {
      floor: [0.05, 0.04, 0.04], gain: [1.02, 0.95, 0.90], offset: [0.04, 0.02, 0.02],
      toe: [0.10, 0.08, 0.07], contrast: [0.92, 0.90, 0.88], shoulder: [0.86, 0.86, 0.84],
      shadowTint: [0.02, -0.004, 0], highlightTint: [0.025, -0.012, -0.02],
      saturation: 0.72, hues: []
    },
    ERA_36: {
      floor: [0.03, 0.03, 0.035], gain: [0.92, 1.0, 1.0], offset: [0.01, 0.015, 0.02],
      toe: [0.08, 0.08, 0.08], contrast: [0.94, 0.96, 0.94], shoulder: [0.86, 0.86, 0.86],
      shadowTint: [-0.01, 0.01, 0.012], highlightTint: [0.012, 0.008, -0.012],
      saturation: 0.80, hues: [[0, 0.08, -0.25, 0.02], [0.30, 0.12, 0, 0.04]]
    },
    AZURE_100: {
      floor: [0.006, 0.006, 0.008], gain: [0.96, 1.0, 1.05], offset: [0, 0, 0.004],
      toe: [0.0, 0.0, 0.005], contrast: [1.3, 1.3, 1.28], shoulder: [0.9, 0.9, 0.92],
      shadowTint: [-0.004, 0, 0.008], highlightTint: [-0.006, 0, 0.006],
      saturation: 1.14, hues: [[0.6, 0.1, 0.15, 0]]
    },
    PURE_100: {
      floor: [0.004, 0.004, 0.004], gain: [1.005, 1.0, 0.985], offset: [0.002, 0, 0],
      toe: [0.0, 0.0, 0.0], contrast: [1.32, 1.32, 1.32], shoulder: [0.91, 0.91, 0.91],
      shadowTint: [0, 0, 0], highlightTint: [0.018, -0.006, 0.008],
      saturation: 1.0, hues: []
    },
    DAILY_200: {
      floor: [0.012, 0.012, 0.012], gain: [0.99, 1.01, 1.03], offset: [0, 0.004, 0.008],
      toe: [0.035, 0.04, 0.04], contrast: [1.1, 1.12, 1.1], shoulder: [0.9, 0.9, 0.91],
      shadowTint: [0, 0.004, 0.004], highlightTint: [0, 0.002, 0.004],
      saturation: 1.34, hues: [[0.3, 0.12, 0.4, 0.02], [0.58, 0.1, 0.35, 0]]
    },
    PUNCH_100: {
      floor: [0.004, 0.004, 0.008], gain: [1.0, 1.02, 0.94], offset: [0, 0.006, 0.016],
      toe: [0.0, 0.0, 0.02], contrast: [1.38, 1.34, 1.18], shoulder: [0.87, 0.87, 0.84],
      shadowTint: [-0.012, 0.0, 0.018], highlightTint: [0.004, 0.016, -0.016],
      saturation: 1.25, hues: []
    },
    CRISP_100: {
      floor: [0.008, 0.008, 0.008], gain: [1.02, 1.0, 1.0], offset: [0.004, 0, 0],
      toe: [0.01, 0.01, 0.01], contrast: [1.22, 1.2, 1.22], shoulder: [0.9, 0.9, 0.9],
      shadowTint: [0, 0, 0.004], highlightTint: [0.004, 0, 0],
      saturation: 1.42, hues: [[0.0, 0.07, 0.4, 0], [0.62, 0.1, 0.4, 0], [0.04, 0.05, 0.15, -0.012]]
    },
    INFRA: {
      floor: [0.01, 0.01, 0.01], gain: [1.0, 1.0, 1.0], offset: [0, 0, 0],
      toe: [0.02, 0.02, 0.02], contrast: [1.15, 1.15, 1.15], shoulder: [0.88, 0.88, 0.88],
      shadowTint: [0, 0, 0], highlightTint: [0, 0, 0],
      saturation: 1.15, hues: [[0.3, 0.16, 0.6, -0.36], [0.58, 0.1, 0.3, 0.02]]
    },
    RISE_200: {
      floor: [0.004, 0.004, 0.004], gain: [1.07, 0.98, 0.88], offset: [0.02, 0.006, 0],
      toe: [0.0, 0.0, 0.0], contrast: [1.4, 1.38, 1.34], shoulder: [0.84, 0.85, 0.86],
      shadowTint: [0.01, 0, -0.008], highlightTint: [0.02, 0.008, -0.014],
      saturation: 1.08, hues: [[0.3, 0.12, -0.35, -0.03]]
    }
  };

  var MONO_CURVES = {
    GRIT_400: { weights: [0.30, 0.62, 0.08], toe: 0,    contrast: 1.42, shoulder: 0.92, tint: [1, 1, 1] },
    MONO_125: { weights: [0.25, 0.65, 0.10], toe: 0.07, contrast: 0.90, shoulder: 0.88, tint: [1.0, 0.97, 0.90] }
  };

  function applyCurve(c, r0, g0, b0) {
    function ch(x, i) {
      var v = F(F(max2(F(x), F(c.floor[i]))) * F(c.gain[i])) + F(c.offset[i]);
      return characteristicCurve(F(v), F(c.toe[i]), F(c.contrast[i]), F(c.shoulder[i]));
    }
    var r = ch(r0, 0), g = ch(g0, 1), b = ch(b0, 2);
    var l = luma709(r, g, b);
    var ws = F(1 - smoothstep(0, F(0.5), l));
    var wh = smoothstep(F(0.45), 1, l);
    r = F(r + F(F(ws * F(c.shadowTint[0])) + F(wh * F(c.highlightTint[0]))));
    g = F(g + F(F(ws * F(c.shadowTint[1])) + F(wh * F(c.highlightTint[1]))));
    b = F(b + F(F(ws * F(c.shadowTint[2])) + F(wh * F(c.highlightTint[2]))));
    var grey = luma709(r, g, b);
    var sat = F(c.saturation);
    r = mix(grey, r, sat); g = mix(grey, g, sat); b = mix(grey, b, sat);
    for (var i = 0; i < c.hues.length; i++) {
      var hs = c.hues[i];
      var t = hueGrade(r, g, b, hs[0], hs[1], hs[2], hs[3]);
      r = t[0]; g = t[1]; b = t[2];
    }
    return [r, g, b];
  }

  function applyMono(m, r, g, b) {
    var w0 = F(m.weights[0]), w1 = F(m.weights[1]), w2 = F(m.weights[2]);
    var num = F(F(F(r) * w0) + F(F(g) * w1) + F(F(b) * w2));
    var den = F(F(w0 + w1) + w2);
    return characteristicCurve(F(num / den), F(m.toe), F(m.contrast), F(m.shoulder));
  }

  function sceneRedShare(r, g, b) {
    var mx = max3(r, g, b);
    return mx <= 0 ? 1 : c01(F(F(r) / mx));
  }

  function neutralizeClippedHighlight(r, g, b, redShare) {
    var mx = max3(r, g, b);
    var mn = min3(r, g, b);
    var mid = F(F(F(r + g) + b) - mx - mn);
    var bright = smoothstep(F(0.72), F(0.95), mx);
    var coolCast = c01(F(F(mx - r) * F(2.5)));
    var whiteish = smoothstep(F(0.70), F(0.92), mid);
    var wasWhite = smoothstep(F(0.42), F(0.52), redShare);
    var amount = F(F(F(F(bright * coolCast) * whiteish) * wasWhite) * F(0.95));
    if (amount <= 0) return [r, g, b];
    return [mix(r, mx, amount), mix(g, mx, F(amount * F(0.4))), b];
  }

  function gradeStock(stockKey, r0In, g0In, b0In) {
    var r0 = F(r0In), g0 = F(g0In), b0 = F(b0In);
    var r = r0, g = g0, b = b0;
    var grey, lum, shadow, high, h;

    if (DATA_CURVES[stockKey]) {
      var crv = applyCurve(DATA_CURVES[stockKey], r0, g0, b0);
      r = crv[0]; g = crv[1]; b = crv[2];
    } else if (stockKey === 'GRIT_400') {
      var gv = applyMono(MONO_CURVES.GRIT_400, r0, g0, b0);
      r = gv; g = gv; b = gv;
    } else if (stockKey === 'MONO_125') {
      var mv = applyMono(MONO_CURVES.MONO_125, r0, g0, b0);
      r = F(mv * F(1.0)); g = F(mv * F(0.97)); b = F(mv * F(0.90));
    } else {
      switch (stockKey) {
        case 'KODAK_400':
          r = max2(r, F(0.012)); g = max2(g, F(0.011)); b = max2(b, F(0.008));
          r = characteristicCurve(F(F(r * F(1.07)) + F(0.02)), F(0.06), F(1.20), F(0.86));
          g = characteristicCurve(F(F(g * F(0.98)) + F(0.01)), F(0.05), F(1.18), F(0.87));
          b = characteristicCurve(F(b * F(0.93)), F(0.03), F(1.14), F(0.90));
          grey = luma709(r, g, b);
          r = mix(grey, r, F(1.26)); g = mix(grey, g, F(1.26)); b = mix(grey, b, F(1.26));
          h = hueGrade(r, g, b, F(0.55), F(0.08), F(0.30), 0);
          r = h[0]; g = h[1]; b = h[2];
          break;
        case 'FUJI_400H':
          r = characteristicCurve(F(r * F(0.96)), F(0.06), F(1.06), F(0.90));
          g = characteristicCurve(F(g * F(1.04)), F(0.07), F(1.08), F(0.90));
          b = characteristicCurve(F(b * F(1.03)), F(0.06), F(1.08), F(0.92));
          grey = luma601(r, g, b);
          r = mix(grey, r, F(1.06)); g = mix(grey, g, F(1.06)); b = mix(grey, b, F(1.06));
          break;
        case 'ILFORD_HP5':
          lum = softClip(sCurve(luma601(r, g, b), F(0.40), F(-0.020)), F(0.88));
          r = lum; g = lum; b = lum;
          break;
        case 'CINEMA_800':
          r = max2(r, F(0.015)); g = max2(g, F(0.015)); b = max2(b, F(0.021));
          lum = luma709(r, g, b);
          shadow = F(1 - smoothstep(0, F(0.50), lum));
          high = smoothstep(F(0.55), 1, lum);
          r = c01(F(F(sCurve(F(r * F(0.96)), F(0.28), F(-0.025)) - F(shadow * F(0.045))) + F(high * F(0.025))));
          g = c01(F(sCurve(F(g * F(1.02)), F(0.24), F(-0.018)) + F(shadow * F(0.020))));
          b = c01(F(F(softClip(sCurve(F(b * F(1.06)), F(0.22), 0), F(0.88)) + F(shadow * F(0.055))) - F(high * F(0.045))));
          grey = luma709(r, g, b);
          r = mix(grey, r, F(1.12)); g = mix(grey, g, F(1.12)); b = mix(grey, b, F(1.12));
          break;
        case 'PORTRA_800':
          grey = luma601(r, g, b);
          r = mix(grey, r, F(1.16)); g = mix(grey, g, F(1.16)); b = mix(grey, b, F(1.16));
          r = softClip(sCurve(r, F(0.36), F(0.005)), F(0.89));
          g = sCurve(g, F(0.30), 0);
          b = sCurve(F(b * F(0.91)), F(0.24), F(-0.012));
          h = hueGrade(r, g, b, F(0.055), F(0.085), F(0.26), F(0.005));
          r = h[0]; g = h[1]; b = h[2];
          break;
        case 'PORTRA_160':
          grey = luma601(r, g, b);
          r = mix(grey, r, F(1.13)); g = mix(grey, g, F(1.13)); b = mix(grey, b, F(1.13));
          r = softClip(sCurve(r, F(0.30), F(-0.010)), F(0.92));
          g = sCurve(g, F(0.27), F(-0.010));
          b = sCurve(F(b * F(0.97)), F(0.23), F(-0.015));
          h = hueGrade(r, g, b, F(0.055), F(0.085), F(0.26), F(0.005));
          r = h[0]; g = h[1]; b = h[2];
          break;
        case 'AGFA_ULTRA':
          r = max2(r, F(0.010)); g = max2(g, F(0.010)); b = max2(b, F(0.010));
          r = characteristicCurve(F(r * F(1.06)), F(0.04), F(1.20), F(0.84));
          g = characteristicCurve(F(g * F(1.02)), F(0.04), F(1.14), F(0.86));
          b = characteristicCurve(F(b * F(0.97)), F(0.04), F(1.12), F(0.88));
          grey = luma601(r, g, b);
          r = mix(grey, r, F(1.38)); g = mix(grey, g, F(1.38)); b = mix(grey, b, F(1.38));
          h = hueGrade(r, g, b, F(0.055), F(0.085), F(0.24), F(0.004));
          h = hueGrade(h[0], h[1], h[2], F(0.24), F(0.10), F(0.18), 0);
          h = hueGrade(h[0], h[1], h[2], F(0.60), F(0.09), F(0.10), 0);
          r = h[0]; g = h[1]; b = h[2];
          break;
        case 'FUJI_VELVIA':
          grey = luma601(r, g, b);
          r = mix(grey, r, F(1.34)); g = mix(grey, g, F(1.34)); b = mix(grey, b, F(1.34));
          r = sCurve(F(r * F(0.95)), F(0.28), F(-0.02));
          g = softClip(sCurve(F(g * F(1.12)), F(0.34), 0), F(0.87));
          b = softClip(sCurve(F(b * F(1.06)), F(0.30), F(-0.01)), F(0.90));
          h = hueGrade(r, g, b, F(0.30), F(0.11), F(0.30), 0);
          h = hueGrade(h[0], h[1], h[2], F(0.60), F(0.10), F(0.24), 0);
          r = h[0]; g = h[1]; b = h[2];
          break;
        case 'CCD_2000':
          lum = luma601(r, g, b);
          r = softClip(sCurve(F(r * F(0.96)), F(0.18), F(0.005)), F(0.80));
          g = softClip(sCurve(F(g * F(0.97)), F(0.18), F(0.005)), F(0.80));
          b = softClip(sCurve(F(b * F(1.06)), F(0.18), F(0.010)), F(0.80));
          r = mix(lum, r, F(0.92)); g = mix(lum, g, F(0.92)); b = mix(lum, b, F(0.92));
          break;
        case 'CCD_PINK':
          r = softClip(sCurve(F(F(r * F(1.07)) + F(0.02)), F(0.12), F(0.005)), F(0.93));
          g = sCurve(F(g * F(0.96)), F(0.10), 0);
          b = softClip(sCurve(F(F(b * F(1.02)) + F(0.01)), F(0.12), F(0.005)), F(0.93));
          break;
        case 'DISPOSABLE':
          lum = luma601(r, g, b);
          shadow = F(1 - smoothstep(0, F(0.42), lum));
          high = smoothstep(F(0.58), 1, lum);
          r = softClip(F(F(F(r * F(1.02)) + F(0.01)) + F(high * F(0.020))), F(0.82));
          g = softClip(F(F(F(g * F(1.03)) + F(0.01)) + F(shadow * F(0.022))), F(0.82));
          b = softClip(F(F(b * F(0.99)) + F(shadow * F(0.012))), F(0.86));
          r = smoothstep(F(0.04), F(0.98), r);
          g = smoothstep(F(0.04), F(0.98), g);
          b = smoothstep(F(0.05), F(0.96), b);
          grey = luma601(r, g, b);
          r = mix(grey, r, F(0.93)); g = mix(grey, g, F(0.93)); b = mix(grey, b, F(0.93));
          break;
        case 'SUPER8':
          r = max2(r, F(0.012)); g = max2(g, F(0.012)); b = max2(b, F(0.012));
          r = characteristicCurve(F(F(r * F(1.07)) + F(0.02)), F(0.075), F(1.05), F(0.82));
          g = characteristicCurve(F(F(g * F(1.00)) + F(0.012)), F(0.070), F(1.04), F(0.84));
          b = characteristicCurve(F(F(b * F(0.90)) + F(0.008)), F(0.060), F(1.03), F(0.86));
          grey = luma601(r, g, b);
          r = mix(grey, r, F(0.78)); g = mix(grey, g, F(0.78)); b = mix(grey, b, F(0.78));
          break;
        case 'KODAK_GOLD_200':
          r = max2(r, F(0.012)); g = max2(g, F(0.010)); b = max2(b, F(0.008));
          r = characteristicCurve(F(F(r * F(1.06)) + F(0.02)), F(0.04), F(1.18), F(0.84));
          g = characteristicCurve(F(F(g * F(1.02)) + F(0.01)), F(0.03), F(1.14), F(0.86));
          b = characteristicCurve(F(b * F(0.90)), F(0.02), F(1.10), F(0.80));
          grey = luma709(r, g, b);
          r = mix(grey, r, F(1.20)); g = mix(grey, g, F(1.20)); b = mix(grey, b, F(1.20));
          h = hueGrade(r, g, b, F(0.055), F(0.085), F(0.22), F(0.004));
          r = h[0]; g = h[1]; b = h[2];
          break;
        case 'KODAK_250D':
          r = max2(r, F(0.010)); g = max2(g, F(0.010)); b = max2(b, F(0.010));
          r = characteristicCurve(F(F(r * F(1.02)) + F(0.006)), F(0.055), F(1.10), F(0.90));
          g = characteristicCurve(F(F(g * F(1.01)) + F(0.005)), F(0.055), F(1.09), F(0.90));
          b = characteristicCurve(F(b * F(0.99)), F(0.050), F(1.07), F(0.90));
          grey = luma709(r, g, b);
          r = mix(grey, r, F(1.10)); g = mix(grey, g, F(1.10)); b = mix(grey, b, F(1.10));
          break;
        case 'KODACHROME_64':
          r = max2(r, F(0.010)); g = max2(g, F(0.010)); b = max2(b, F(0.010));
          lum = luma709(r, g, b);
          shadow = F(1 - smoothstep(0, F(0.38), lum));
          r = characteristicCurve(F(r * F(1.03)), F(0.035), F(1.28), F(0.88));
          g = characteristicCurve(F(g * F(1.00)), F(0.035), F(1.27), F(0.88));
          b = c01(F(characteristicCurve(F(b * F(0.99)), F(0.030), F(1.24), F(0.86)) + F(shadow * F(0.022))));
          grey = luma709(r, g, b);
          r = mix(grey, r, F(1.30)); g = mix(grey, g, F(1.30)); b = mix(grey, b, F(1.30));
          h = hueGrade(r, g, b, F(0.055), F(0.085), F(0.20), F(0.006));
          h = hueGrade(h[0], h[1], h[2], F(0.24), F(0.10), F(0.22), 0);
          h = hueGrade(h[0], h[1], h[2], F(0.60), F(0.09), F(0.18), 0);
          r = h[0]; g = h[1]; b = h[2];
          break;
      }
    }

    var n = neutralizeClippedHighlight(r, g, b, sceneRedShare(r0, g0, b0));
    return [c01(n[0]), c01(n[1]), c01(n[2])];
  }

  // ── 3. True Skin v2 (SkinPull.kt + LutExporter.skinWeight chroma gate) ──
  function skinTonePullCpu(rScene, gScene, bScene, rIn, gIn, bIn, targetCb, targetCr, pullStrength) {
    if (pullStrength <= 0 || rScene - gScene <= 0.02) {
      return [Math.max(0, Math.min(1, rIn)), Math.max(0, Math.min(1, gIn)), Math.max(0, Math.min(1, bIn))];
    }
    var lumi = 0.299 * rIn + 0.587 * gIn + 0.114 * bIn;
    var lumaMask = 4.0 * lumi * (1.0 - lumi);
    var lumiScene = 0.299 * rScene + 0.587 * gScene + 0.114 * bScene;
    var rgDiff = rScene - gScene;
    var gbDiff = gScene - bScene;
    var hueRamp = smoothstep(0.02, 0.08, rgDiff);
    var isSkinHue = hueRamp * smoothstep(-0.02, 0.05, gbDiff);
    var notTooRed = 1.0 - smoothstep(0.35, 0.50, rgDiff);
    var warmthRatio = rgDiff / Math.max(lumiScene, 0.06);
    var isSkinWarmth = smoothstep(0.07, 0.13, warmthRatio);
    var chromaGraded = Math.max(rIn, gIn, bIn) - Math.min(rIn, gIn, bIn);
    var chromaKept = smoothstep(0.005, 0.02, chromaGraded);
    var skinWeight = lumaMask * isSkinHue * notTooRed * isSkinWarmth * chromaKept;
    var s = Math.min(pullStrength * skinWeight, 0.5);
    if (s <= 0) return [rIn, gIn, bIn];

    var cb = bIn - lumi, cr = rIn - lumi;
    var scale = 0.7675 + 0.375 * lumi;
    var tCb = targetCb * scale, tCr = targetCr * scale;
    var tMag = Math.hypot(tCb, tCr);
    var cMag = Math.hypot(cb, cr);
    var limit = 1.1 * cMag;
    if (tMag > limit && tMag > 0) {
      var k = limit / tMag;
      tCb *= k; tCr *= k;
    }
    var uR = tCr - cr;
    var uB = tCb - cb;
    if (uR > 0) uR *= Math.max(0, Math.min(1, (1.0 - rIn) / Math.max(uR * s, 0.0001)));
    var uG = -(0.299 * uR + 0.114 * uB) / 0.587;

    function room(c, u) { return u > 0 ? (1.0 - c) / Math.max(u, 0.001) : (u < 0 ? c / Math.max(-u, 0.001) : 1e9); }
    s = Math.min(s, room(rIn, uR), room(gIn, uG), room(bIn, uB));
    var stepLen = s * Math.hypot(uR, uB);
    if (stepLen > 0.02) s *= 0.02 / stepLen;
    return [
      Math.max(0, Math.min(1, rIn + s * uR)),
      Math.max(0, Math.min(1, gIn + s * uG)),
      Math.max(0, Math.min(1, bIn + s * uB))
    ];
  }

  // ── 4. GrainSlider.kt + CameraUiState.effectiveGrainAmplitude + GrainStructureConstants ──
  var GrainSlider = {
    MAX_INTENSITY: 0.75,
    DEFAULT_POSITION: 0.25,
    position: function (intensity) {
      var clamped = Math.max(0, Math.min(0.75, intensity));
      var m = clamped * 2.0;
      return m <= 1.0 ? (m * 0.25) : (0.25 + (m - 1.0) / 0.5 * 0.75);
    },
    intensity: function (pos) {
      var p = Math.max(0, Math.min(1, pos));
      var m = p <= 0.25 ? (p / 0.25) : (1.0 + (p - 0.25) / 0.75 * 0.5);
      return m / 2.0;
    },
    percent: function (intensity) {
      return Math.round(GrainSlider.position(intensity) * 100);
    }
  };

  // ── 4b. RollPush.kt & RollPushDevelop.kt (1.0.7 Roll Push/Pull: -1, 0, +1, +2 stops) ──
  var ISO_SERIES = [
    6, 8, 10, 12, 16, 20, 25, 32, 40, 50, 64, 80, 100, 125, 160, 200, 250, 320, 400, 500, 640, 800,
    1000, 1250, 1600, 2000, 2500, 3200
  ];

  var RollPushDevelop = {
    STOPS: [-1, 0, 1, 2],
    paramsFor: function (stops) {
      if (stops === -1) return { contrast: 0.90, slope: -0.10, toe: 0.02,  grainScale: 0.80 };
      if (stops === 1)  return { contrast: 1.12, slope:  0.12, toe: -0.02, grainScale: 1.35 };
      if (stops === 2)  return { contrast: 1.25, slope:  0.25, toe: -0.04, grainScale: 1.80 };
      return { contrast: 1.00, slope: 0.00, toe: 0.00, grainScale: 1.00 };
    },
    effectiveStops: function (stock, stops) {
      if (!stock || !stock.pushable) return 0;
      return (stops === -1 || stops === 1 || stops === 2) ? stops : 0;
    },
    exposureIndex: function (stock, stops) {
      if (!stock || !stock.iso) return null;
      var eff = RollPushDevelop.effectiveStops(stock, stops);
      var target = stock.iso * Math.pow(2.0, eff);
      var best = ISO_SERIES[0], bestDist = 1e9;
      for (var i = 0; i < ISO_SERIES.length; i++) {
        var d = Math.abs(Math.log(ISO_SERIES[i]) - Math.log(target));
        if (d < bestDist) { bestDist = d; best = ISO_SERIES[i]; }
      }
      return best;
    },
    channel: function (x, stops) {
      if (!stops) return x;
      var p = RollPushDevelop.paramsFor(stops);
      var sloped = 0.45 + (x - 0.45) * p.contrast;
      var st = Math.max(0, Math.min(1, Math.max(0, sloped) / 0.3));
      var sm = st * st * (3.0 - 2.0 * st);
      var toed = sloped + p.toe * (1.0 - sm);
      var out = toed <= 0.9 ? toed : (0.9 + 0.1 * (1.0 - Math.exp(-(toed - 0.9) / 0.1)));
      return Math.max(0, Math.min(1, out));
    },
    applyRgb: function (r, g, b, stops) {
      if (!stops) return [r, g, b];
      return [
        RollPushDevelop.channel(r, stops),
        RollPushDevelop.channel(g, stops),
        RollPushDevelop.channel(b, stops)
      ];
    }
  };

  function effectiveGrainAmplitude(stock, storedIntensity, body, pushStops) {
    var clamped = Math.max(0, Math.min(GrainSlider.MAX_INTENSITY, storedIntensity));
    var fmtScale = (body && body.grainScale) ? body.grainScale : 1.0;
    var effStops = RollPushDevelop.effectiveStops(stock, pushStops || 0);
    var pushScale = RollPushDevelop.paramsFor(effStops).grainScale;
    return stock.grain * (clamped * 2.0) * fmtScale * pushScale;
  }

  function clumpWeightFor(stockGrain) {
    var t = Math.max(0, Math.min(1, (stockGrain - 0.015) / (0.070 - 0.015)));
    var sm = t * t * (3.0 - 2.0 * t);
    return 0.12 + sm * (0.35 - 0.12);
  }

  function lookHalation(sliderVal, recipeHalOverride, body, stock) {
    if (stock.mono) return 0.0;
    if (sliderVal != null) return sliderVal;
    if (recipeHalOverride != null) return recipeHalOverride;
    return (body ? body.hal : 0.08) * stock.hal;
  }

  // ── 5. RecipeCodec.kt (40-bit v2/v1 Base36 8-char code + XOR-folded byte checksum) ──
  var ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var LEGACY_PRESET_CODES = {
    '1RR0EF8X': 'Aesthetic Muted',
    '1TB2WW3M': 'Bali Dusk',
    '1RBCCIHS': 'Bukchon Vintage',
    '1TNP86OH': 'Busan Bright',
    '1X5IQKJV': 'Charcoal Seafood',
    '1R8FEEMG': 'Charcoal Seafood',
    '1ZN591HF': 'Hotpot Steam',
    '1X6CXFIE': 'Moody Table',
    '1R85027L': 'Banh Mi Noon',
    '1R99IT1J': 'Hotpot Steam',
    '1X44AOVW': 'Iced Coffee Morning',
    '1U5PN3ZY': 'K-pop Studio',
    '1Y4H7LC3': 'Parisian Chic',
    '1SRNDQ1D': 'Singapore Night',
    '1R7UM2KA': 'Vlog Bright',
    '1SCY4V2W': 'Tokyo Mood',
    '1VC6E3PY': 'Saigon Noir',
    '1SU01Z9B': 'Jakarta Street'
  };

  function encodeBase36(bigBits) {
    var v = bigBits;
    var chars = new Array(8);
    for (var i = 7; i >= 0; i--) {
      chars[i] = ALPHABET[Number(v % 36n)];
      v = v / 36n;
    }
    return chars.join('');
  }

  function decodeBase36(code) {
    var res = 0n;
    for (var i = 0; i < code.length; i++) {
      var idx = ALPHABET.indexOf(code[i]);
      if (idx < 0) return null;
      res = res * 36n + BigInt(idx);
    }
    return res;
  }

  var RecipeCodec = {
    encode: function (spec) {
      var stock = typeof spec.filmStock === 'string' ? STOCK_BY_KEY[spec.filmStock] : spec.filmStock;
      var skin = typeof spec.skinToneMode === 'string' ? SKIN_BY_KEY[spec.skinToneMode] : spec.skinToneMode;
      var frame = typeof spec.frameStyle === 'string' ? FRAME_BY_KEY[spec.frameStyle] : (spec.frameStyle || FRAME_BY_KEY.NONE);
      if (!stock) stock = STOCK_BY_KEY.KODAK_400;
      if (!skin) skin = SKIN_BY_KEY.NEUTRAL;
      if (!frame) frame = FRAME_BY_KEY.NONE;

      var version = 2n;
      var stockId = BigInt(Math.max(0, Math.min(63, stock.stableId)));
      // Kotlin `(recipe.grainIntensity * 100f).toLong().coerceIn(0, 100)` truncates toward zero after 32-bit float mul!
      var grainRaw = BigInt(Math.max(0, Math.min(100, Math.trunc(F(F(spec.grainIntensity) * F(100))))));
      var filterRaw = BigInt(Math.max(0, Math.min(63, Math.trunc(F(F(spec.filterStrength) * F(63))))));
      var skinId = BigInt(Math.max(0, Math.min(7, skin.stableId)));
      var stamp = spec.dateStampEnabled ? 1n : 0n;
      var frameId = BigInt(Math.max(0, Math.min(3, frame.stableId)));

      var bits = (version << 36n) | (stockId << 30n) | (grainRaw << 23n) | (filterRaw << 17n) |
                 (skinId << 14n) | (stamp << 13n) | (frameId << 11n);

      var highWord = (bits >> 8n) & 0xFFFFFFFFn;
      var csum = (highWord ^ (highWord >> 8n) ^ (highWord >> 16n) ^ (highWord >> 24n)) & 0xFFn;
      bits = bits | csum;
      return encodeBase36(bits);
    },
    decode: function (rawCode) {
      if (typeof rawCode !== 'string') return null;
      var norm = rawCode.trim().toUpperCase();
      if (norm.length !== 8) return null;
      var bits = decodeBase36(norm);
      if (bits === null) return null;
      if (bits > 0xFFFFFFFFFFn) return null;

      var highWord = (bits >> 8n) & 0xFFFFFFFFn;
      var expected = (highWord ^ (highWord >> 8n) ^ (highWord >> 16n) ^ (highWord >> 24n)) & 0xFFn;
      if (expected !== (bits & 0xFFn)) return null;

      var version = Number((bits >> 36n) & 0xFn);
      var stockRaw = Number((bits >> 30n) & 0x3Fn);
      var grainRaw = Number((bits >> 23n) & 0x7Fn);
      var filterRaw = Number((bits >> 17n) & 0x3Fn);
      var skinRaw = Number((bits >> 14n) & 0x7n);
      var dateStamp = Number((bits >> 13n) & 0x1n) === 1;
      var frameRaw = Number((bits >> 11n) & 0x3n);

      var stock, skin, frame;
      if (version === 1) {
        if (stockRaw >= STOCKS.length || skinRaw >= SKINS.length || frameRaw >= FRAMES.length) return null;
        stock = STOCKS[stockRaw];
        skin = SKIN_BY_ORDINAL[skinRaw];
        frame = FRAMES[frameRaw];
      } else if (version === 2) {
        stock = STOCK_BY_ID[stockRaw];
        skin = SKIN_BY_ID[skinRaw];
        frame = FRAME_BY_ID[frameRaw];
      } else {
        return null;
      }
      if (!stock || !skin || !frame) return null;

      return {
        filmStock: stock.key,
        grainIntensity: Math.max(0, Math.min(1, grainRaw / 100.0)),
        filterStrength: Math.max(0, Math.min(1, filterRaw / 63.0)),
        skinToneMode: skin.key,
        dateStampEnabled: dateStamp,
        frameStyle: frame.key,
        legacyPresetName: LEGACY_PRESET_CODES[norm] || null
      };
    }
  };

  // ── 6. 33^3 Shader-Order 3D LUT Cache + 17^3 .cube Exporter (LutExporter.kt) ──
  var LUT_CACHE = {};
  function getStockLut33(stockKey) {
    if (LUT_CACHE[stockKey]) return LUT_CACHE[stockKey];
    var size = 33;
    // Shader order (transposeCubeToShaderOrder): width = size*size (1089), height = size (33)
    // texel x = b*size + r, y = g => dst pixel index = g*size*size + b*size + r
    var rgba = new Uint8Array(size * size * size * 4);
    var floats = new Float32Array(size * size * size * 3); // CUBE order for CPU trilinear
    for (var b = 0; b < size; b++) {
      var bf = b / (size - 1);
      for (var g = 0; g < size; g++) {
        var gf = g / (size - 1);
        for (var r = 0; r < size; r++) {
          var rf = r / (size - 1);
          var out = gradeStock(stockKey, rf, gf, bf);
          var cubeIdx = (b * size * size + g * size + r) * 3;
          floats[cubeIdx] = out[0];
          floats[cubeIdx + 1] = out[1];
          floats[cubeIdx + 2] = out[2];

          var shIdx = (g * size * size + b * size + r) * 4;
          rgba[shIdx]     = Math.round(out[0] * 255);
          rgba[shIdx + 1] = Math.round(out[1] * 255);
          rgba[shIdx + 2] = Math.round(out[2] * 255);
          rgba[shIdx + 3] = 255;
        }
      }
    }
    var entry = { size: size, rgba: rgba, floats: floats };
    LUT_CACHE[stockKey] = entry;
    return entry;
  }

  function generateCube(spec) {
    var stock = STOCK_BY_KEY[spec.filmStock] || STOCK_BY_KEY.KODAK_400;
    var skin = SKIN_BY_KEY[spec.skinToneMode] || SKIN_BY_KEY.NEUTRAL;
    var str = spec.filterStrength == null ? 1.0 : spec.filterStrength;
    var wb = (spec.kelvin && spec.kelvin >= 1000) ? spec.kelvin : null;
    var shadowLift = spec.shadowLift || 0;
    var highlightRolloff = spec.highlightRolloff || 0;

    var wbR = 1.0, wbB = 1.0;
    if (wb) {
      var t = (wb - 6500.0) / 3500.0;
      if (t < 0) { wbR = 1.0 - t * 0.2; wbB = 1.0 + t * 0.4; }
      else { wbR = 1.0 - t * 0.3; wbB = 1.0 + t * 0.3; }
    }

    var lines = [];
    lines.push('# LAM Film Camera — Exported LUT');
    lines.push('# Recipe: ' + (spec.name || 'Web Studio Custom'));
    lines.push('# Code:   ' + RecipeCodec.encode(spec));
    lines.push('# Stock:  ' + stock.name);
    lines.push('# Skin:   ' + skin.label);
    lines.push('# Strength: ' + Math.round(str * 100) + '%');
    if (wb) lines.push('# WB:     ' + Math.round(wb) + 'K  (BAKED into this LUT)');
    lines.push('# Generated by LAM — brewkits.dev/lam');
    lines.push('');
    lines.push('LUT_3D_SIZE 17');
    lines.push('DOMAIN_MIN 0.0 0.0 0.0');
    lines.push('DOMAIN_MAX 1.0 1.0 1.0');
    lines.push('');

    function fmt(v) {
      var s = (Math.round(v * 1000000) / 1000000).toString();
      return (s.indexOf('.') >= 0 || s.indexOf('e') >= 0) ? s : (s + '.0');
    }

    for (var bi = 0; bi < 17; bi++) {
      var b = bi / 16.0;
      for (var gi = 0; gi < 17; gi++) {
        var g = gi / 16.0;
        for (var ri = 0; ri < 17; ri++) {
          var r = ri / 16.0;
          var g1 = gradeStock(stock.key, r, g, b);
          var g2 = stock.mono ? g1 : skinTonePullCpu(r, g, b, g1[0], g1[1], g1[2], skin.targetCb, skin.targetCr, skin.pullStrength);
          var rO = Math.max(0, Math.min(1, r * (1 - str) + g2[0] * str));
          var gO = Math.max(0, Math.min(1, g * (1 - str) + g2[1] * str));
          var bO = Math.max(0, Math.min(1, b * (1 - str) + g2[2] * str));
          rO = Math.max(0, Math.min(1, rO * wbR));
          bO = Math.max(0, Math.min(1, bO * wbB));
          if (shadowLift !== 0 || highlightRolloff !== 0) {
            var td = applyToneCurveDna(rO, gO, bO, shadowLift, highlightRolloff);
            rO = td[0]; gO = td[1]; bO = td[2];
          }
          lines.push(fmt(rO) + ' ' + fmt(gO) + ' ' + fmt(bO));
        }
      }
    }
    return lines.join('\n') + '\n';
  }

  // ── 7. HaloField.kt Port (LOW_RES_LONG_EDGE = 400, 25-tap Separable Gaussian Look C) ──
  function gaussianKernel(sigmaCells) {
    var rad = 12;
    var k = new Float32Array(2 * rad + 1);
    var total = 0;
    for (var i = 0; i < k.length; i++) {
      var d = i - rad;
      var w = Math.exp(-(d * d) / (2.0 * sigmaCells * sigmaCells));
      k[i] = w;
      total += w;
    }
    for (var j = 0; j < k.length; j++) k[j] /= total;
    return k;
  }

  function blurSeparable(src, w, h, sigmaCells) {
    var k = gaussianKernel(Math.max(0.25, sigmaCells));
    var rad = 12;
    var tmp = new Float32Array(w * h);
    var out = new Float32Array(w * h);
    for (var y = 0; y < h; y++) {
      var row = y * w;
      for (var x = 0; x < w; x++) {
        var acc = 0;
        for (var j = -rad; j <= rad; j++) {
          var xx = x + j;
          if (xx < 0) xx = 0; else if (xx >= w) xx = w - 1;
          acc += k[j + rad] * src[row + xx];
        }
        tmp[row + x] = acc;
      }
    }
    for (var y2 = 0; y2 < h; y2++) {
      for (var x2 = 0; x2 < w; x2++) {
        var acc2 = 0;
        for (var j2 = -rad; j2 <= rad; j2++) {
          var yy = y2 + j2;
          if (yy < 0) yy = 0; else if (yy >= h) yy = h - 1;
          acc2 += k[j2 + rad] * tmp[yy * w + x2];
        }
        out[y2 * w + x2] = acc2;
      }
    }
    return out;
  }

  function buildHaloFieldFromRgba(rgba, width, height) {
    var longEdge = Math.max(width, height);
    var n = Math.min(400, longEdge);
    var lw = Math.max(1, Math.round(width * n / longEdge));
    var lh = Math.max(1, Math.round(height * n / longEdge));
    var sum = new Float32Array(lw * lh);
    var cnt = new Int32Array(lw * lh);

    for (var y = 0; y < height; y++) {
      var cy = ((y * lh / height) | 0) * lw;
      var srcRow = y * width * 4;
      for (var x = 0; x < width; x++) {
        var idx = srcRow + x * 4;
        var r = rgba[idx] / 255.0;
        var g = rgba[idx + 1] / 255.0;
        var b = rgba[idx + 2] / 255.0;
        var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        var hi = smoothstep(0.78, 1.0, luma) * r;
        var cell = cy + ((x * lw / width) | 0);
        sum[cell] += hi;
        cnt[cell]++;
      }
    }
    var low = new Float32Array(lw * lh);
    for (var i = 0; i < low.length; i++) low[i] = cnt[i] > 0 ? (sum[i] / cnt[i]) : 0;

    var gridLong = Math.max(lw, lh);
    var glow = blurSeparable(low, lw, lh, 0.01 * gridLong);
    var region = blurSeparable(low, lw, lh, 0.008 * gridLong);
    var tex = new Uint8Array(lw * lh * 4);
    for (var p = 0; p < low.length; p++) {
      tex[p * 4]     = Math.max(0, Math.min(255, Math.round(glow[p] * 255)));
      tex[p * 4 + 1] = Math.max(0, Math.min(255, Math.round(region[p] * 255)));
      tex[p * 4 + 2] = 0;
      tex[p * 4 + 3] = 255;
    }
    return { lowW: lw, lowH: lh, glow: glow, region: region, rgba: tex };
  }

  // ── 8. WebGL 1.0 Fragment Shader Renderer (Verbatim FilmShader.kt Pipeline) + Canvas2D Fallback ──
  var VERT_SRC = [
    'attribute vec2 aPos;',
    'varying vec2 vTexCoord;',
    'void main() {',
    '  vTexCoord = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);',
    '  gl_Position = vec4(aPos, 0.0, 1.0);',
    '}'
  ].join('\n');

  var FRAG_SRC = [
    'precision highp float;',
    'varying vec2 vTexCoord;',
    'uniform sampler2D uSceneTex;',
    'uniform sampler2D uLutTex;',
    'uniform sampler2D uBloomTex;',
    'uniform vec2 uTexelSize;',
    'uniform float uStrength;',
    'uniform float uTargetCb;',
    'uniform float uTargetCr;',
    'uniform float uPullStrength;',
    'uniform float uHaloStr;',
    'uniform float uGrain;',
    'uniform float uClumpWeight;',
    'uniform float uTime;',
    'uniform float uVigStr;',
    'uniform float uKelvin;',
      'uniform float uShadowLift;',
    'uniform float uHighlightRolloff;',
    'uniform float uPushSlope;',
    'uniform float uPushToe;',
    'uniform int uLeakType;',
    'uniform float uLightLeak;',
    'uniform float uSplitX;',
    '',
    'vec3 lutTexel(float sIdx, float ri, float gj) {',
    '  float x = (sIdx * 33.0 + ri + 0.5) / 1089.0;',
    '  float y = (gj + 0.5) / 33.0;',
    '  return texture2D(uLutTex, vec2(x, y)).rgb;',
    '}',
    '',
    'vec3 apply3DLut(vec3 color) {',
    '  vec3 c = clamp(color, 0.0, 1.0) * 32.0;',
    '  vec3 c0 = floor(c);',
    '  vec3 c1 = min(c0 + 1.0, 32.0);',
    '  vec3 f = c - c0;',
    '  vec3 s0 = mix(mix(lutTexel(c0.b, c0.r, c0.g), lutTexel(c0.b, c1.r, c0.g), f.r),',
    '                mix(lutTexel(c0.b, c0.r, c1.g), lutTexel(c0.b, c1.r, c1.g), f.r), f.g);',
    '  vec3 s1 = mix(mix(lutTexel(c1.b, c0.r, c0.g), lutTexel(c1.b, c1.r, c0.g), f.r),',
    '                mix(lutTexel(c1.b, c0.r, c1.g), lutTexel(c1.b, c1.r, c1.g), f.r), f.g);',
    '  return mix(s0, s1, f.b);',
    '}',
    '',
    'vec3 lamSkinTone(vec3 color, vec3 scene, float targetCb, float targetCr, float pullStrength) {',
    '  if (pullStrength <= 0.0 || scene.r - scene.g <= 0.02) return clamp(color, 0.0, 1.0);',
    '  float lumi = dot(color, vec3(0.299, 0.587, 0.114));',
    '  float lumaMask = 4.0 * lumi * (1.0 - lumi);',
    '  float lumiScene = dot(scene, vec3(0.299, 0.587, 0.114));',
    '  float rgDiff = scene.r - scene.g;',
    '  float gbDiff = scene.g - scene.b;',
    '  float hueRamp = smoothstep(0.02, 0.08, rgDiff);',
    '  float isSkinHue = hueRamp * smoothstep(-0.02, 0.05, gbDiff);',
    '  float notTooRed = 1.0 - smoothstep(0.35, 0.50, rgDiff);',
    '  float warmthRatio = rgDiff / max(lumiScene, 0.06);',
    '  float isSkinWarmth = smoothstep(0.07, 0.13, warmthRatio);',
    '  float chromaGraded = max(max(color.r, color.g), color.b) - min(min(color.r, color.g), color.b);',
    '  float chromaKept = smoothstep(0.005, 0.02, chromaGraded);',
    '  float skinWeight = lumaMask * isSkinHue * notTooRed * isSkinWarmth * chromaKept;',
    '  float s = min(pullStrength * skinWeight, 0.5);',
    '  vec2 c = vec2(color.b - lumi, color.r - lumi);',
    '  vec2 t = vec2(targetCb, targetCr) * (0.7675 + 0.375 * lumi);',
    '  float tMag = length(t);',
    '  float limit = 1.1 * length(c);',
    '  t *= (tMag > limit && tMag > 0.0) ? limit / tMag : 1.0;',
    '  vec3 u = vec3(t.y - c.y, 0.0, t.x - c.x);',
    '  if (u.r > 0.0) u.r *= clamp((1.0 - color.r) / max(u.r * s, 0.0001), 0.0, 1.0);',
    '  u.g = -(0.299 * u.r + 0.114 * u.b) / 0.587;',
    '  vec3 room = mix(color / max(-u, 0.001), (1.0 - color) / max(u, 0.001), step(0.0, u));',
    '  s = min(s, min(room.r, min(room.g, room.b)));',
    '  float stepLen = s * length(vec2(u.r, u.b));',
    '  s *= (stepLen > 0.02) ? 0.02 / stepLen : 1.0;',
    '  return clamp(color + s * u, 0.0, 1.0);',
    '}',
    '',
    'vec3 lamHalation(vec2 uv, vec3 colorIn, float haloStr) {',
    '  if (haloStr < 0.001) return colorIn;',
    '  vec2 field = texture2D(uBloomTex, uv).rg;',
    '  float bleed = field.r * (1.0 - smoothstep(0.25, 0.6, field.g)) * haloStr * 1.375;',
    '  return clamp(colorIn + vec3(bleed, bleed * 0.15, bleed * 0.05), 0.0, 1.0);',
    '}',
    '',
    'vec3 lamKelvin(vec3 color, float kelvin) {',
    '  if (kelvin < 1000.0) return color;',
    '  float t = (kelvin - 6500.0) / 3500.0;',
    '  vec3 scale = vec3(1.0);',
    '  if (t < 0.0) { scale.r = 1.0 - t * 0.2; scale.b = 1.0 + t * 0.4; }',
    '  else { scale.r = 1.0 - t * 0.3; scale.b = 1.0 + t * 0.3; }',
    '  return clamp(color * scale, 0.0, 1.0);',
    '}',
    '',
    'vec3 lamToneCurveDna(vec3 color, float shadowLift, float highlightRolloff) {',
    '  if (shadowLift < 0.0001 && highlightRolloff < 0.0001) return color;',
    '  float shoulderStart = clamp(0.9 - highlightRolloff, 0.5, 0.9);',
    '  vec3 lifted = color + shadowLift * (1.0 - smoothstep(0.0, 0.3, color));',
    '  vec3 excess = max(lifted - shoulderStart, 0.0);',
    '  vec3 range = vec3(1.0 - shoulderStart);',
    '  vec3 shaped = shoulderStart + range * (1.0 - exp(-excess / range));',
    '  return clamp(mix(lifted, shaped, step(shoulderStart, lifted)), 0.0, 1.0);',
    '}',
    '',
    'vec3 lamRollPush(vec3 c, float slope, float toe) {',
    '  if (abs(slope) < 0.0001 && abs(toe) < 0.0001) return c;',
    '  vec3 s = 0.45 + (c - 0.45) * (1.0 + slope);',
    '  vec3 t = s + toe * (1.0 - smoothstep(0.0, 0.3, max(s, 0.0)));',
    '  vec3 h = 0.9 + 0.1 * (1.0 - exp(-max(t - 0.9, 0.0) / 0.1));',
    '  return clamp(mix(t, h, step(0.9, t)), 0.0, 1.0);',
    '}',
    '',
    'float lamTemporalPhase(float seed) { return fract(sin(seed) * 43758.5453); }',
    'float lamHashCell(vec2 co, float phase) {',
    '  vec3 p = fract(vec3(co.xy, phase) * 0.1031);',
    '  p += dot(p, p.yzx + 33.33);',
    '  return fract((p.x + p.y) * p.z);',
    '}',
    'vec3 lamFilmGrain(vec2 uv, float lumi, float intensity, float seed, float clumpWeight) {',
    '  if (intensity < 0.0001) return vec3(0.0);',
    '  float phase = lamTemporalPhase(seed);',
    '  float lumiMod = clamp(pow(clamp(1.0 - lumi * 0.75, 0.0, 1.0), 0.7) * sin(clamp(lumi * 3.14159, 0.0, 3.14159)) * 1.5, 0.0, 1.0);',
    '  float fineWeight = 1.0 - clumpWeight;',
    '  float normFactor = 0.8246211 / sqrt(fineWeight * fineWeight + clumpWeight * clumpWeight);',
    '  vec2 texSize = 1.0 / uTexelSize;',
    '  vec2 grid = texSize * (960.0 / max(texSize.x, texSize.y));',
    '  vec2 cf = floor(uv * grid);',
    '  vec2 cc = floor(uv * grid * 0.38);',
    '  float r = ((lamHashCell(cf + vec2(11.0, 17.0), phase) * fineWeight + lamHashCell(cc + vec2(5003.0, 7001.0), phase * 0.7) * clumpWeight) - 0.5) * normFactor * intensity * lumiMod;',
    '  float g = ((lamHashCell(cf + vec2(97.0, 43.0), phase) * fineWeight + lamHashCell(cc + vec2(6101.0, 3307.0), phase * 0.7) * clumpWeight) - 0.5) * normFactor * intensity * lumiMod * 0.6;',
    '  float b = ((lamHashCell(cf + vec2(53.0, 89.0), phase) * fineWeight + lamHashCell(cc + vec2(2903.0, 8111.0), phase * 0.7) * clumpWeight) - 0.5) * normFactor * intensity * lumiMod * 0.8;',
    '  return vec3(r, g, b);',
    '}',
    '',
    'float lamVignette(vec2 uv, float vigStr) {',
    '  if (vigStr < 0.001) return 1.0;',
    '  vec2 d = (uv - 0.5) * 2.0;',
    '  float r = length(d) * vigStr;',
    '  float cosT = 1.0 / sqrt(1.0 + r * r);',
    '  return pow(cosT, 4.0);',
    '}',
    '',
    'void main() {',
    '  vec4 raw = texture2D(uSceneTex, vTexCoord);',
    '  if (uSplitX > 0.0 && vTexCoord.x < uSplitX) {',
    '    gl_FragColor = vec4(raw.rgb, 1.0);',
    '    return;',
    '  }',
    '  vec3 color = apply3DLut(raw.rgb);',
    '  color = lamSkinTone(color, raw.rgb, uTargetCb, uTargetCr, uPullStrength);',
    '  color = lamHalation(vTexCoord, color, uHaloStr);',
    '  color = mix(raw.rgb, color, uStrength);',
    '',
    '  // 4-tap raw-luma unsharp mask (FilmShader.SHARPEN_STRENGTH = 0.25)',
    '  vec3 shBlur = (',
    '    texture2D(uSceneTex, vTexCoord + vec2( uTexelSize.x, 0.0)).rgb +',
    '    texture2D(uSceneTex, vTexCoord + vec2(-uTexelSize.x, 0.0)).rgb +',
    '    texture2D(uSceneTex, vTexCoord + vec2(0.0,  uTexelSize.y)).rgb +',
    '    texture2D(uSceneTex, vTexCoord + vec2(0.0, -uTexelSize.y)).rgb',
    '  ) * 0.25;',
    '  float shEdge = dot(raw.rgb - shBlur, vec3(0.2126, 0.7152, 0.0722)) * 0.25;',
    '  color = clamp(color + vec3(shEdge), 0.0, 1.0);',
    '',
    '  // LightLeakStyle (1=CORNER_WARM, 2=EDGE_COOL, 3=CENTER_BURN)',
    '  if (uLeakType == 1) {',
    '    float leak = vTexCoord.x * (1.0 - vTexCoord.y) * uLightLeak;',
    '    color.r = clamp(color.r + leak, 0.0, 1.0);',
    '    color.g = clamp(color.g + leak * 0.3, 0.0, 1.0);',
    '  } else if (uLeakType == 2) {',
    '    float leakEdge = max((1.0 - vTexCoord.x) * uLightLeak * 0.7, vTexCoord.x * uLightLeak * 0.5);',
    '    color.b = clamp(color.b + leakEdge, 0.0, 1.0);',
    '    color.g = clamp(color.g + leakEdge * 0.3, 0.0, 1.0);',
    '  } else if (uLeakType == 3) {',
    '    float d = length(vTexCoord - vec2(0.5, 0.5));',
    '    float burn = (1.0 - smoothstep(0.2, 0.7, d)) * uLightLeak * 0.18;',
    '    color.r = clamp(color.r + burn, 0.0, 1.0);',
    '    color.g = clamp(color.g + burn * 0.4, 0.0, 1.0);',
    '  }',
    '',
    '  color = lamKelvin(color, uKelvin);',
    '  color = lamToneCurveDna(color, uShadowLift, uHighlightRolloff);',
    '  color = lamRollPush(color, uPushSlope, uPushToe);',
    '  float lumiOut = dot(color, vec3(0.2126, 0.7152, 0.0722));',
    '  color += lamFilmGrain(vTexCoord, lumiOut, uGrain, uTime, uClumpWeight);',
    '  color *= lamVignette(vTexCoord, uVigStr);',
    '  float dither = fract(dot(gl_FragCoord.xy, vec2(0.75487767, 0.56984029)));',
    '  color = clamp(color + (dither - 0.5) * 0.00392157, 0.0, 1.0);',
    '  gl_FragColor = vec4(color, 1.0);',
    '}'
  ].join('\n');

  function createRenderer(canvas) {
    var gl = null;
    try {
      gl = canvas.getContext('webgl', { alpha: false, antialias: false, preserveDrawingBuffer: true }) ||
           canvas.getContext('experimental-webgl', { alpha: false, antialias: false, preserveDrawingBuffer: true });
    } catch (e) { gl = null; }

    var state = {
      isWebGL: false,
      sceneW: 960,
      sceneH: 640,
      rawPixels: null,
      halo: null,
      currentStockKey: null
    };

    if (gl) {
      function compile(type, src) {
        var sh = gl.createShader(type);
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
          console.error('LAM WebGL shader error:', gl.getShaderInfoLog(sh));
          gl.deleteShader(sh);
          return null;
        }
        return sh;
      }
      var vs = compile(gl.VERTEX_SHADER, VERT_SRC);
      var fs = compile(gl.FRAGMENT_SHADER, FRAG_SRC);
      var prog = (vs && fs) ? gl.createProgram() : null;
      if (prog) {
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) prog = null;
      }
      if (prog) {
        state.isWebGL = true;
        gl.useProgram(prog);
        var buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        var aPos = gl.getAttribLocation(prog, 'aPos');
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        function mkTex(filter) {
          var t = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, t);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
          return t;
        }
        var sceneTex = mkTex(gl.LINEAR);
        var lutTex = mkTex(gl.NEAREST);
        var bloomTex = mkTex(gl.LINEAR);

        var U = {};
        ['uSceneTex','uLutTex','uBloomTex','uTexelSize','uStrength','uTargetCb','uTargetCr','uPullStrength',
         'uHaloStr','uGrain','uClumpWeight','uTime','uVigStr','uKelvin','uShadowLift','uHighlightRolloff',
         'uPushSlope','uPushToe','uLeakType','uLightLeak','uSplitX'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

        gl.uniform1i(U.uSceneTex, 0);
        gl.uniform1i(U.uLutTex, 1);
        gl.uniform1i(U.uBloomTex, 2);

        return {
          mode: 'webgl',
          setSceneImage: function (imgEl) {
            var w = imgEl.naturalWidth || imgEl.width || 960;
            var h = imgEl.naturalHeight || imgEl.height || 640;
            var maxEdge = 960;
            if (Math.max(w, h) > maxEdge) {
              var sc = maxEdge / Math.max(w, h);
              w = Math.round(w * sc);
              h = Math.round(h * sc);
            }
            canvas.width = w;
            canvas.height = h;
            state.sceneW = w;
            state.sceneH = h;

            var off = document.createElement('canvas');
            off.width = w; off.height = h;
            var octx = off.getContext('2d');
            octx.drawImage(imgEl, 0, 0, w, h);
            var imgData = octx.getImageData(0, 0, w, h);
            state.rawPixels = imgData.data;
            state.halo = buildHaloFieldFromRgba(state.rawPixels, w, h);

            gl.useProgram(prog);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, sceneTex);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, state.rawPixels);

            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, bloomTex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, state.halo.lowW, state.halo.lowH, 0, gl.RGBA, gl.UNSIGNED_BYTE, state.halo.rgba);
          },
          render: function (params) {
            if (!state.rawPixels) return;
            gl.useProgram(prog);
            gl.viewport(0, 0, state.sceneW, state.sceneH);

            if (state.currentStockKey !== params.stockKey) {
              var lut = getStockLut33(params.stockKey);
              gl.activeTexture(gl.TEXTURE1);
              gl.bindTexture(gl.TEXTURE_2D, lutTex);
              gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1089, 33, 0, gl.RGBA, gl.UNSIGNED_BYTE, lut.rgba);
              state.currentStockKey = params.stockKey;
            }

            gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, sceneTex);
            gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, lutTex);
            gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, bloomTex);

            gl.uniform2f(U.uTexelSize, 1.0 / state.sceneW, 1.0 / state.sceneH);
            gl.uniform1f(U.uStrength, params.strength);
            gl.uniform1f(U.uTargetCb, params.targetCb);
            gl.uniform1f(U.uTargetCr, params.targetCr);
            gl.uniform1f(U.uPullStrength, params.pullStrength);
            gl.uniform1f(U.uHaloStr, params.haloStr);
            gl.uniform1f(U.uGrain, params.grainAmp);
            gl.uniform1f(U.uClumpWeight, params.clumpWeight);
            gl.uniform1f(U.uTime, params.timeSeed);
            gl.uniform1f(U.uVigStr, params.vigStr);
            gl.uniform1f(U.uKelvin, params.kelvin || 0);
            gl.uniform1f(U.uShadowLift, params.shadowLift || 0);
            gl.uniform1f(U.uHighlightRolloff, params.highlightRolloff || 0);
            gl.uniform1f(U.uPushSlope, params.pushSlope || 0);
            gl.uniform1f(U.uPushToe, params.pushToe || 0);
            var leakId = params.leak === 'CORNER_WARM' ? 1 : (params.leak === 'EDGE_COOL' ? 2 : (params.leak === 'CENTER_BURN' ? 3 : 0));
            gl.uniform1i(U.uLeakType, leakId);
            gl.uniform1f(U.uLightLeak, leakId > 0 ? 0.12 : 0.0);
            gl.uniform1f(U.uSplitX, params.splitX || 0.0);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
          }
        };
      }
    }

    // Automatic Canvas2D CPU fallback (if WebGL is disabled in headless/restricted environments)
    var ctx2d = canvas.getContext('2d');
    var outImgData = null;
    return {
      mode: 'canvas2d',
      setSceneImage: function (imgEl) {
        var w = 480, h = Math.round(480 * ((imgEl.naturalHeight || 640) / (imgEl.naturalWidth || 960)));
        canvas.width = w; canvas.height = h;
        state.sceneW = w; state.sceneH = h;
        ctx2d.drawImage(imgEl, 0, 0, w, h);
        state.rawPixels = new Uint8ClampedArray(ctx2d.getImageData(0, 0, w, h).data);
        state.halo = buildHaloFieldFromRgba(state.rawPixels, w, h);
        outImgData = ctx2d.createImageData(w, h);
      },
      render: function (params) {
        if (!state.rawPixels || !outImgData) return;
        var w = state.sceneW, h = state.sceneH;
        var src = state.rawPixels, dst = outImgData.data;
        var lut = getStockLut33(params.stockKey).floats;
        var splitPx = params.splitX ? Math.round(params.splitX * w) : 0;
        var halo = state.halo;

        var wbR = 1.0, wbB = 1.0;
        if (params.kelvin >= 1000) {
          var kt = (params.kelvin - 6500.0) / 3500.0;
          if (kt < 0) { wbR = 1.0 - kt * 0.2; wbB = 1.0 + kt * 0.4; }
          else { wbR = 1.0 - kt * 0.3; wbB = 1.0 + kt * 0.3; }
        }

        for (var y = 0; y < h; y++) {
          var v = (y + 0.5) / h;
          for (var x = 0; x < w; x++) {
            var idx = (y * w + x) * 4;
            var r0 = src[idx] / 255.0, g0 = src[idx + 1] / 255.0, b0 = src[idx + 2] / 255.0;
            if (x < splitPx) {
              dst[idx] = src[idx]; dst[idx + 1] = src[idx + 1]; dst[idx + 2] = src[idx + 2]; dst[idx + 3] = 255;
              continue;
            }
            var ri = Math.min(32, Math.round(r0 * 32)), gi = Math.min(32, Math.round(g0 * 32)), bi = Math.min(32, Math.round(b0 * 32));
            var li = (bi * 1089 + gi * 33 + ri) * 3;
            var r = lut[li], g = lut[li + 1], b = lut[li + 2];
            if (params.pullStrength > 0) {
              var sp = skinTonePullCpu(r0, g0, b0, r, g, b, params.targetCb, params.targetCr, params.pullStrength);
              r = sp[0]; g = sp[1]; b = sp[2];
            }
            if (params.haloStr > 0.001 && halo) {
              var hx = Math.min(halo.lowW - 1, (x * halo.lowW / w) | 0);
              var hy = Math.min(halo.lowH - 1, (y * halo.lowH / h) | 0);
              var hi = hy * halo.lowW + hx;
              var bleed = halo.glow[hi] * (1.0 - smoothstep(0.25, 0.6, halo.region[hi])) * params.haloStr * 1.375;
              r = Math.min(1, r + bleed); g = Math.min(1, g + bleed * 0.15); b = Math.min(1, b + bleed * 0.05);
            }
            r = r0 * (1 - params.strength) + r * params.strength;
            g = g0 * (1 - params.strength) + g * params.strength;
            b = b0 * (1 - params.strength) + b * params.strength;
            r = Math.min(1, Math.max(0, r * wbR));
            b = Math.min(1, Math.max(0, b * wbB));
            if (params.pushStops) {
              var rp = RollPushDevelop.applyRgb(r, g, b, params.pushStops);
              r = rp[0]; g = rp[1]; b = rp[2];
            }
            if (params.vigStr > 0.001) {
              var dx = ((x + 0.5) / w - 0.5) * 2.0, dy = (v - 0.5) * 2.0;
              var rr = (dx * dx + dy * dy) * params.vigStr * params.vigStr;
              var vig = 1.0 / ((1.0 + rr) * (1.0 + rr));
              r *= vig; g *= vig; b *= vig;
            }
            dst[idx] = Math.round(r * 255);
            dst[idx + 1] = Math.round(g * 255);
            dst[idx + 2] = Math.round(b * 255);
            dst[idx + 3] = 255;
          }
        }
        ctx2d.putImageData(outImgData, 0, 0);
      }
    };
  }

  var API = {
    STOCKS: STOCKS,
    CURATED_KEYS: CURATED_KEYS,
    STOCK_BY_KEY: STOCK_BY_KEY,
    STOCK_BY_ID: STOCK_BY_ID,
    SKINS: SKINS,
    SKIN_BY_KEY: SKIN_BY_KEY,
    FRAMES: FRAMES,
    BODIES: BODIES,
    gradeStock: gradeStock,
    applyToneCurveDna: applyToneCurveDna,
    skinTonePullCpu: skinTonePullCpu,
    GrainSlider: GrainSlider,
    RollPushDevelop: RollPushDevelop,
    effectiveGrainAmplitude: effectiveGrainAmplitude,
    clumpWeightFor: clumpWeightFor,
    lookHalation: lookHalation,
    RecipeCodec: RecipeCodec,
    getStockLut33: getStockLut33,
    generateCube: generateCube,
    buildHaloFieldFromRgba: buildHaloFieldFromRgba,
    createRenderer: createRenderer
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  root.LamRuntimeGrade = API;
})(typeof window !== 'undefined' ? window : globalThis);
