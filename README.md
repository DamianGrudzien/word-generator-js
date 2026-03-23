# 🔑 Passphrase Generator

A beautiful, configurable passphrase generator hosted on GitHub Pages. Generates secure passphrases from word lists — default is Polish, with easy support for more languages.

## 🚀 Deploy to GitHub Pages

1. **Create a new GitHub repository** (e.g. `passphrase-gen`)

2. **Upload these files** keeping the folder structure:
   ```
   index.html
   words/
     pl.json     ← Polish words
     en.json     ← English words
   README.md
   ```

3. **Enable GitHub Pages:**
   - Go to your repo → **Settings** → **Pages**
   - Under *Source*, select **Deploy from a branch**
   - Choose branch: `main`, folder: `/ (root)`
   - Click **Save**

4. Your site will be live at:
   `https://<your-username>.github.io/<repo-name>/`

---

## ➕ Adding More Languages

### Option A — Add a JSON file to the `words/` folder

Create `words/de.json` (German example):
```json
{
  "language": "Deutsch",
  "code": "de",
  "flag": "🇩🇪",
  "words": ["apfel", "baum", "dach", "eule", "feld", "garten", "haus", "insel", ...]
}
```

Then register it in `index.html` by adding to the `BUILTIN` array:
```js
const BUILTIN = [
  { code: 'pl', flag: '🇵🇱', file: 'words/pl.json' },
  { code: 'en', flag: '🇬🇧', file: 'words/en.json' },
  { code: 'de', flag: '🇩🇪', file: 'words/de.json' },  // ← add this
];
```

### Option B — Add via the UI (no code required)

Click **＋ Add language** in the app, then upload or paste a JSON file. The language is saved in `localStorage` and persists across sessions.

---

## ⚙️ Configuration Options

| Setting | Options |
|---|---|
| Word count | 2 – 8 words |
| Separator | Dash, dot, underscore, space, none, custom |
| Capitalisation | None, First letter, ALL CAPS, rAnDoM |
| Numbers | None, Start, End, Between words |
| Number length | 1 – 4 digits |
| Special chars | None, Start, End, Both ends |
| Special char set | Customisable |

---

## 📄 Word list format

```json
{
  "language": "Language name",
  "code": "xx",
  "flag": "🏳️",
  "words": [
    "word1", "word2", "word3", ...
  ]
}
```

- **Minimum recommended:** 50 words (for good entropy)
- **Ideal:** 100+ words
- Words can contain any Unicode characters (Polish ą, ę, ó etc. are fine)

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` | Generate new passphrase |
| `Ctrl+C` | Copy current passphrase |

---

## 🔒 Privacy

- Everything runs in your browser — no data is ever sent to a server
- History and custom languages are saved in `localStorage` (your device only)
- Uses `crypto.getRandomValues()` for cryptographically secure randomness
