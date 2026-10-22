# LAM landing page generator (brewkits.dev/lam)

Rebuilds `static/lam/index.html` for a release. `python3 build.py` from this folder.

- `index.orig.html` — the pre-1.0.3 page; its I18N/PRICES dictionaries and language bootstrap are kept verbatim.
- `patch_*.py` — per-language copy patched over those dictionaries (12 languages; the build asserts every
  language has the same keys).
- `app_text.json` — body tags and film stories extracted from the app's release sources (all 12 languages).
- `hues.json` — each body's `accentHue` from `CameraBody.kt`.
- `build.py` — catalogue lists (bodies, films, Pro flags) read from `release/1.0.3`; update them when the
  catalogue changes, and re-extract `app_text.json` from the release branch.

Expects `samples/film_sample_*.webp` and `icon-new.png` next to it (copied from the app's
`composeResources/drawable/` and `iosApp/.../AppIcon.appiconset/Icon-1024.png`); the built output already
contains them under `static/lam/`.

Only describe features that ship ON by default in the release (check `LamReleaseFlags.kt`).
