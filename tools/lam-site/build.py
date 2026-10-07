"""Builds the LAM 1.0.3 landing page (brewkits.dev/lam) from the shipped catalogue.

Keeps the page's existing I18N/PRICES dictionaries and language logic verbatim, layers a per-language
patch (I18N_103) on top, and renders the body/film catalogue from data extracted out of the app's own
release/1.0.3 sources (names, Pro flags, localized body tags and film stories).
"""
import json, os, re, shutil, sys

S = os.path.dirname(os.path.abspath(__file__))  # samples/ + icon-new.png expected here (see README)
SITE = os.path.expanduser('~/DATA/PRIVATE/brewkits.github.io/static/lam')
sys.path.insert(0, S)
from patch_en_vi import EN, VI
from patch_cjk import ZH, ZHTW, JA, KO
from patch_sea import TH, ID, MS, TL, KM, LO

PATCH = {'en': EN, 'vi': VI, 'zh': ZH, 'zh-TW': ZHTW, 'ja': JA, 'ko': KO, 'th': TH, 'id': ID, 'ms': MS, 'tl': TL, 'km': KM, 'lo': LO}
keys = set(EN)
for lang, d in PATCH.items():
    missing = keys - set(d)
    extra = set(d) - keys
    assert not missing and not extra, (lang, missing, extra)

app = json.load(open(os.path.join(S, 'app_text.json')))
hues = json.load(open(os.path.join(S, 'hues.json')))

# ── catalogue (release/1.0.3, read from CameraBody.kt / CameraUiState.kt) ─────────────────────
BODIES = [  # enum, display name, decade (from culturalEra), pro, default film
    ('LAM_BOX_36', 'Box 36', '1930s', True, 'Era 36'),
    ('LAM_TWIN_LENS', 'Twin Lens', '1950s', True, 'Mono 125'),
    ('LAM_CLASSIC', 'LAM Classic', '1960s', False, 'Gold 400'),
    ('LAM_HALF_FRAME', 'Half Frame', '1960s', True, 'Grit 400'),
    ('LAM_SLR_70', 'SLR 70', '1970s', True, 'Faded 72'),
    ('LAM_SUPER8', 'Super 8', '1970s', True, 'Super 8'),
    ('LAM_INSTANT_FOLD', 'Instant 81', '1980s', True, 'Square 600'),
    ('LAM_TOY_CAMERA', 'Toy Camera', '1980s', False, 'Punch 100'),
    ('LAM_DISPOSABLE', 'Disposable', '1990s', False, 'Disposable'),
    ('LAM_PORTRA', 'Portia Studio', '1990s', True, 'Portia 160'),
    ('LAM_DONG_DUONG', 'Saigon', '1990s', False, 'Tropic 200'),
    ('LAM_16MM', '16mm Cine', '1990s', True, 'Cine 250D'),
    ('LAM_Y2K', 'Y2K Pink', '1990s', True, 'CCD Pink'),
    ('LAM_CCD', 'CCD Digicam', '2000s', False, 'CCD 2000'),
    ('LAM_SEOUL', 'Seoul', '2000s', True, 'Pastel 400'),
    ('LAM_INSTAX', 'Instant Mini', '2010s', False, 'Mini Instant'),
]
FILMS = [  # enum, name, plate code, pro
    ('KODAK_400', 'Gold 400', 'GLD400', False), ('KODAK_GOLD_200', 'Gold 200', 'GLD200', False),
    ('FUJI_400H', 'Pastel 400', 'PST400', False), ('DISPOSABLE', 'Disposable', 'DISP', False),
    ('CCD_2000', 'CCD 2000', 'CCD2000', False), ('CCD_PINK', 'CCD Pink', 'CCDPNK', False),
    ('MINI_INSTANT', 'Mini Instant', 'MINI', False), ('TROPIC_200', 'Tropic 200', 'TRP200', False),
    ('PUNCH_100', 'Punch 100', 'PNC100', False),
    ('PORTRA_160', 'Portia 160', 'PTA160', True), ('PORTRA_800', 'Portia 800', 'PTA800', True),
    ('CINEMA_800', 'Cinema 800T', 'CIN800T', True), ('KODAK_250D', 'Cine 250D', 'CIN250D', True),
    ('FUJI_ETERNA_160', 'Eternal 160', 'ETN160', True), ('NIGHT_500T', 'Night 500T', 'NGT500T', True),
    ('SUPER8', 'Super 8', 'SUP8', True), ('KODACHROME_64', 'Colorchrome 64', 'CCH64', True),
    ('FUJI_VELVIA', 'Velvet 50', 'VLV50', True), ('AGFA_ULTRA', 'Ultra 50', 'ULT50', True),
    ('AZURE_100', 'Azure 100', 'AZR100', True), ('PURE_100', 'Pure 100', 'PUR100', True),
    ('CRISP_100', 'Crisp 100', 'CRS100', True), ('DAILY_200', 'Daily 200', 'DLY200', True),
    ('RISE_200', 'Rise 200', 'RSE200', True), ('SQUARE_600', 'Square 600', 'SQ600', True),
    ('FADED_72', 'Faded 72', 'FDD72', True), ('ERA_36', 'Era 36', 'ERA36', True),
    ('INFRA', 'Infra', 'INFRA', True), ('ILFORD_HP5', 'Silver 400', 'SLV400', True),
    ('GRIT_400', 'Grit 400', 'GRT400', True), ('MONO_125', 'Mono 125', 'MON125', True),
]
MONO = {'ILFORD_HP5', 'GRIT_400', 'MONO_125'}
assert len(BODIES) == 16 and len(FILMS) == 31
assert sum(not b[3] for b in BODIES) == 6 and sum(not f[3] for f in FILMS) == 9

data = {
    'bodies': [{'k': k, 'n': n, 'd': d, 'p': p, 'f': f, 'h': hues[k], 't': {l: app['tags'][l][k] for l in PATCH}} for k, n, d, p, f in BODIES],
    'films': [{'k': k, 'n': n, 'c': c, 'p': p, 'm': k in MONO, 'img': 'img/films/' + k.lower() + '.webp',
               's': {l: [app['stories'][l][k]['vibe'], app['stories'][l][k]['bestFor']] for l in PATCH}} for k, n, c, p in FILMS],
}

# ── assets ────────────────────────────────────────────────────────────────────────────────────
os.makedirs(os.path.join(SITE, 'img', 'films'), exist_ok=True)
for k, *_ in FILMS:
    shutil.copyfile(os.path.join(S, 'samples', 'film_sample_' + k.lower() + '.webp'), os.path.join(SITE, 'img', 'films', k.lower() + '.webp'))
shutil.copyfile(os.path.join(S, 'icon-new.png'), os.path.join(SITE, 'icon-1024.png'))

old = open(os.path.join(SITE, 'index.html')).read() if not os.path.exists(os.path.join(S, 'index.orig.html')) else open(os.path.join(S, 'index.orig.html')).read()
if not os.path.exists(os.path.join(S, 'index.orig.html')):
    open(os.path.join(S, 'index.orig.html'), 'w').write(old)
script = re.search(r'(?s)<script>(.*?)</script>', old).group(1)
# The language bootstrap at the end runs applyLang; ours must be merged BEFORE it. Split there.
boot = script.index('(function(){\n  var saved;')
dicts, bootstrap = script[:boot], script[boot:]

css = open(os.path.join(S, 'style.css')).read()
body = open(os.path.join(S, 'body.html')).read()
app_js = open(os.path.join(S, 'app.js')).read()

head = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LAM — A film camera with soul</title>
<meta name="description" content="A film camera with soul. Live film grade tuned for Asian skin — 31 films, 16 camera bodies, 49 looks, True Skin per person, true 4K, .cube LUT export and shareable recipe codes. On-device and private. Pay once, no subscription.">
<meta name="theme-color" content="#0b0907">
<meta property="og:title" content="LAM — A film camera with soul">
<meta property="og:description" content="31 films, 16 camera bodies, 49 looks — graded live on your phone, never on a server.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://brewkits.dev/lam/">
<meta property="og:image" content="https://brewkits.dev/lam/icon-1024.png">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="LAM — A film camera with soul">
<meta name="twitter:description" content="31 films, 16 camera bodies, 49 looks — graded live on your phone, never on a server.">
<meta name="twitter:image" content="https://brewkits.dev/lam/icon-1024.png">
<link rel="icon" href="/img/icon.png">
<link rel="alternate" type="application/rss+xml" href="/lam-sitemap.xml">
<style>
''' + css + '''
</style>
</head>
'''

page = head + body + '<script>\n' + dicts + '\nvar I18N_103 = ' + json.dumps(PATCH, ensure_ascii=False) + ';\n' + \
    'var LAM_DATA = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n' + \
    app_js + '\n' + bootstrap + '</script>\n</body>\n</html>\n'
open(os.path.join(SITE, 'index.html'), 'w').write(page)
print('written', len(page), 'bytes')
