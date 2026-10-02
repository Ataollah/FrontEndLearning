# CSS Normalization Cheatsheet

## 1. Browser Default Styles

Every browser applies its own **user-agent stylesheet** before your CSS runs.

**Common inconsistencies:**
| Element | Chrome | Firefox | Safari |
|---------|--------|---------|--------|
| `<body>` margin | 8px | 8px | 8px |
| `<h1>` font-size | 2em | 2em | 2em |
| `<ul>` padding | 40px | 40px | 40px |
| `<button>` font | system | system | different |
| `<input>` border | varies | varies | varies |

**Why it matters:** Layouts break across browsers without normalization.

---

## 2. CSS Reset vs Normalize.css

| Feature | **CSS Reset** | **Normalize.css** |
|---------|--------------|-------------------|
| Approach | Removes **all** default styles | Preserves **useful** defaults |
| Philosophy | Blank slate | Consistent baseline |
| Headings | Same size (unstyled) | Keep relative sizes |
| Lists | No bullets/indent | Keep bullets |
| Forms | Fully stripped | Fixed inconsistencies |
| Size | ~1KB | ~8KB |
| Best for | Full custom design | General web projects |

**Reset example (Eric Meyer):**
```css
* { margin: 0; padding: 0; border: 0; font-size: 100%; font: inherit; vertical-align: baseline; }
```

**Normalize example:**
```css
html { line-height: 1.15; -webkit-text-size-adjust: 100%; }
body { margin: 0; }
main { display: block; }
```

---

## 3. Using Normalize.css

**Install via CDN:**
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css">
```

**Install via npm:**
```bash
npm install normalize.css
```
```js
import 'normalize.css';
```

**Install via download:** [necolas.github.io/normalize.css](https://necolas.github.io/normalize.css/)

**What it fixes:**
- ✅ Corrects `line-height` and font inheritance
- ✅ Fixes `button`, `input`, `select` font inconsistencies
- ✅ Removes default `body` margin
- ✅ Normalizes `h1` sizing in sections
- ✅ Fixes `sub`/`sup` positioning
- ✅ Prevents `img` border in IE
- ✅ HTML5 element display in old browsers

**Order matters:** Load Normalize **before** your own CSS.
```html
<link rel="stylesheet" href="normalize.css">
<link rel="stylesheet" href="styles.css">   <!-- your styles win -->
```

---

## 4. Universal Selector Reset (`*`)

**Basic reset:**
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
```

**Modern box-sizing reset (recommended):**
```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

**Full aggressive reset:**
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  border: 0;
  font: inherit;
  vertical-align: baseline;
}
```

**Pros:**
- One-liner, tiny
- Total control
- Great for pixel-perfect designs

**Cons:**
- ❌ Kills useful defaults (list bullets, heading sizes)
- ❌ Performance cost on huge DOMs (rarely an issue now)
- ❌ Accessibility: removes focus outlines if not careful
- ❌ Must restyle everything manually

**⚠️ Never do this:**
```css
* { outline: none; }  /* Breaks keyboard accessibility */
```

---

## Quick Decision Guide

```
Need full design control?        → CSS Reset or * { margin:0; padding:0 }
Building a general website?      → Normalize.css
Want minimal + modern?           → * { box-sizing: border-box } only
Want both?                       → Normalize.css + box-sizing reset
```

**Recommended modern combo:**
```css
/* 1. Normalize */
@import 'normalize.css';

/* 2. Box sizing */
*, *::before, *::after {
  box-sizing: border-box;
}

/* 3. Your styles */
```