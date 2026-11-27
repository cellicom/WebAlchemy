# WebAlchemy

A retro, pixel-art alchemy game that runs entirely in the browser. Start from six base elements and combine them to discover **583 elements** in total. Playable on desktop and mobile, installable as a PWA, and available in English and Italian.

No build step, no dependencies, no backend: it is just static files.

## How to play

1. You start with six base elements: **Earth, Water, Air, Fire, Cold, Light**.
2. **Free mode** (🧪): tap an element in the list to place it on the board, then drag one element onto another to combine them. If the pair is a valid recipe, both are replaced by the result.
   - Double tap/click an element on the board to duplicate it.
   - Drag an element onto the list to delete it.
3. **Forge mode** (🔥): fill exactly two slots from the list and press the combine button. A valid recipe shows the new element; an invalid one plays an error sound.
4. Every discovery is saved automatically, so closing the page loses nothing.

Some pairs have more than one possible result; the game gives you an element you have not found yet first.

### Other features

- **Element list** (📋): every element in alphabetical order. Found ones show their icon and the recipe that made them. Missing ones show a black silhouette and `????`, revealing only the ingredients you already know. The search bar only matches what is visible, so it cannot be used to spoil hidden elements.
- **Goals** (🏆): milestones and "find this element" goals, each with the date it was reached.
- **Info** (ℹ️ on an element): shows the combination you used to find it.
- **Settings** (⚙️): language (defaults to the browser language), sound on/off, six colour themes (Classic, Forest, Vaporwave, Game Boy, White, Black), reset progress, and an About page.
- **8-bit icons**: every element has a 32x32 icon, generated at runtime from emoji, mapped to a fixed 32-colour palette with light dithering and a 1px outline.
- **PWA**: installable and playable offline thanks to the manifest and service worker.

## Run it

Any static server works. A service worker needs `http://localhost` or `https`, so do not open `index.html` straight from disk if you want the offline/install features:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## How it works

| File | Purpose |
|---|---|
| `index.html`, `style.css` | Page structure and styling (CSS variables drive the themes). |
| `game.js` | All game logic: board, drag and merge, forge, list, goals, themes, i18n, sound, saving. |
| `data.js` | Generated data: element names (IT/EN), emoji, base elements and the recipe table. |
| `version.js` | Build version, stamped automatically on commit. |
| `sw.js`, `manifest.webmanifest`, `icon-*.png` | PWA support. |
| `logo.svg`, `favicon.svg` | Pixel-art logo and favicon. |
| `tools/` | Scripts that generate `data.js` and the logo. |

- **Recipes** are stored as `"a,b" -> [results]`, with element ids sorted so that order does not matter. A pair may map to several results.
- **Saving** uses `localStorage`: found elements (with the recipe that discovered them), the board layout, goals with their dates, and the settings.
- **Icons** are drawn on a canvas at 4x size, downsampled to 32x32, quantised to the palette and cached as data URLs. The list silhouettes reuse the same canvases, painted black.
- **Language** is stored in the settings; the element names live in `data.js`, the interface strings in `game.js`.

### Regenerating the data

`data.js` is built from a plain-text list of recipes (`combinations.txt`, one line per element, written in Italian) plus `tools/names.txt` (`Italian|English|emoji`). The recipe file is kept out of the repository (see `.gitignore`), so to regenerate you need your own copy:

```sh
python3 tools/parse.py parsed.json     # parse combinations.txt, report undefined or unreachable elements
python3 tools/build.py parsed.json tools/names.txt   # writes data.js
python3 tools/logo.py                  # writes logo.svg and favicon.svg
```

### Versioning

The repository ships a pre-commit hook that stamps `version.js` with `YYYYMMDDHHSS` and renames the service-worker cache so installed clients refresh. Enable it once after cloning:

```sh
git config core.hooksPath .githooks
```

## Credits

Created by ♥ [cellicom](https://linktr.ee/cellicom). Licensed under the MIT License, see [LICENSE](LICENSE).
