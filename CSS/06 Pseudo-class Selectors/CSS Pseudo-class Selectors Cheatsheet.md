# CSS Pseudo-class Selectors Cheatsheet

## 1. Dynamic Pseudo-classes

| Selector | Description | Example |
|----------|-------------|---------|
| `:link` | Unvisited links | `a:link { color: blue; }` |
| `:visited` | Visited links | `a:visited { color: purple; }` |
| `:hover` | Mouse over element | `a:hover { color: red; }` |
| `:active` | Element being clicked | `a:active { color: green; }` |
| `:focus` | Element has focus (keyboard/tab) | `input:focus { border: 2px solid blue; }` |

**LVHA Order:** `:link` → `:visited` → `:hover` → `:active`

```css
a:link    { color: #0066cc; }
a:visited { color: #663399; }
a:hover   { color: #ff6600; text-decoration: underline; }
a:active  { color: #cc0000; }
input:focus { outline: 2px solid #007bff; }
```

---

## 2. Structural Pseudo-classes

| Selector | Description | Example |
|----------|-------------|---------|
| `:first-child` | First child of parent | `li:first-child { font-weight: bold; }` |
| `:last-child` | Last child of parent | `li:last-child { border: none; }` |
| `:nth-child(n)` | nth child (any type) | `li:nth-child(3) { color: red; }` |
| `:nth-of-type(n)` | nth element of its type | `p:nth-of-type(2) { color: blue; }` |
| `:not(selector)` | Excludes matching elements | `p:not(.special) { color: gray; }` |

### nth-child patterns

| Pattern | Meaning |
|---------|---------|
| `:nth-child(3)` | Exactly 3rd |
| `:nth-child(odd)` | 1st, 3rd, 5th… |
| `:nth-child(even)` | 2nd, 4th, 6th… |
| `:nth-child(3n)` | Every 3rd (3, 6, 9…) |
| `:nth-child(2n+1)` | Odd (same as odd) |
| `:nth-child(-n+3)` | First 3 |
| `:nth-child(n+4)` | 4th and onward |

```css
ul li:first-child { border-top: none; }
ul li:last-child  { border-bottom: none; }
tr:nth-child(even) { background: #f2f2f2; }
p:nth-of-type(1) { font-size: 1.2em; }
input:not([type="submit"]) { border: 1px solid #ccc; }
```

---

## 3. Form Pseudo-classes

| Selector | Description | Example |
|----------|-------------|---------|
| `:checked` | Checked checkbox/radio/option | `input:checked + label { font-weight: bold; }` |
| `:disabled` | Disabled form element | `input:disabled { opacity: 0.5; }` |
| `:enabled` | Enabled form element | `input:enabled { background: #fff; }` |
| `:required` | Required field | `input:required { border-left: 3px solid red; }` |
| `:invalid` | Fails validation | `input:invalid { border-color: red; }` |
| `:valid` | Passes validation | `input:valid { border-color: green; }` |

```css
input:checked { accent-color: #007bff; }
button:disabled { cursor: not-allowed; }
input:required:invalid { border: 2px solid red; }
input:required:valid   { border: 2px solid green; }
```

**Bonus:** `:optional`, `:read-only`, `:read-write`, `:in-range`, `:out-of-range`, `:placeholder-shown`

---

## 4. Target Pseudo-class

| Selector | Description | Example |
|----------|-------------|---------|
| `:target` | Element matching URL hash | `#section:target { background: yellow; }` |

```css
/* URL: page.html#section2 */
#section2:target {
  background: #ffffcc;
  border-left: 4px solid orange;
}
```

Useful for in-page navigation, tab-like interfaces, and modal toggling.

---

## 5. Root Pseudo-class

| Selector | Description | Example |
|----------|-------------|---------|
| `:root` | Document root (`<html>`) | `:root { --main-color: #333; }` |

```css
:root {
  --primary: #007bff;
  --spacing: 1rem;
  font-size: 16px;
}

body {
  color: var(--primary);
  padding: var(--spacing);
}
```

**Key uses:** defining CSS custom properties (variables), setting global font-size/rem base, higher specificity than `html`.

---

## Quick Reference Summary

| Category | Pseudo-classes |
|----------|---------------|
| **Dynamic** | `:link` `:visited` `:hover` `:active` `:focus` |
| **Structural** | `:first-child` `:last-child` `:nth-child()` `:nth-of-type()` `:not()` |
| **Form** | `:checked` `:disabled` `:enabled` `:required` `:invalid` `:valid` |
| **Target** | `:target` |
| **Root** | `:root` |

### Syntax Reminders
- `:nth-child(an+b)` — `a` = cycle size, `b` = offset
- `:not()` accepts simple selectors (comma-separated lists in modern browsers)
- `:hover` should come after `:link`/`:visited` for links to work correctly
- Pseudo-classes use **single colon** `:` (vs. pseudo-elements `::`)