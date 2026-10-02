# CSS Cheatsheet 🎨

## 1. CSS Syntax Basics

```css
selector {
    property: value;
}
```

**Example:**
```css
p {
    color: blue;
    font-size: 16px;
}
```

| Part | Description | Example |
|------|-------------|---------|
| **Selector** | Targets HTML element(s) | `h1`, `.class`, `#id` |
| **Property** | Style attribute to change | `color`, `margin`, `display` |
| **Value** | Setting for the property | `red`, `10px`, `block` |
| **Declaration** | Property + Value pair | `color: red;` |
| **Rule Set** | Selector + declarations | `p { color: red; }` |

### Common Selectors
```css
* { }              /* Universal */
p { }              /* Element */
.class { }         /* Class */
#id { }            /* ID */
div p { }          /* Descendant */
div > p { }        /* Direct child */
a:hover { }        /* Pseudo-class */
p::first-line { }  /* Pseudo-element */
input[type="text"] { }  /* Attribute */
```

---

## 2. Three Ways to Add CSS

### 🔹 Inline CSS (highest priority)
Applied directly to an element via `style` attribute.
```html
<p style="color: red; font-size: 20px;">Hello</p>
```
- ✅ Quick, overrides other styles
- ❌ Not reusable, clutters HTML

### 🔹 Internal CSS
Placed inside `<style>` tag in the `<head>`.
```html
<head>
    <style>
        p { color: blue; }
    </style>
</head>
```
- ✅ Good for single-page styling
- ❌ Not shared across pages

### 🔹 External CSS (best practice)
Linked via `<link>` tag to a `.css` file.
```html
<head>
    <link rel="stylesheet" href="styles.css">
</head>
```
```css
/* styles.css */
p { color: green; }
```
- ✅ Reusable, cacheable, clean separation
- ❌ Extra HTTP request

---

## 3. CSS Comments

```css
/* Single-line comment */

/*
   Multi-line
   comment
*/
```
> ⚠️ Don't confuse with HTML comments `<!-- -->` or JS `//`.

---

## 4. Specificity & Cascade

### Cascade Order (later rules win, if equal specificity)
1. **Inline styles** (highest)
2. **Internal / External** (order matters)
3. **Browser defaults** (lowest)

### Specificity Weight (a, b, c, d)
| Type | Weight | Example |
|------|--------|---------|
| Inline style | 1,0,0,0 | `style="..."` |
| ID | 0,1,0,0 | `#header` |
| Class / Attribute / Pseudo-class | 0,0,1,0 | `.btn`, `[type]`, `:hover` |
| Element / Pseudo-element | 0,0,0,1 | `p`, `::before` |
| Universal `*` | 0,0,0,0 | — |

### Examples
```css
p                   /* 0,0,0,1 */
.text               /* 0,0,1,0 */
p.text              /* 0,0,1,1 */
#main               /* 0,1,0,0 */
#main .text p       /* 0,1,1,1 */
```

### Comparison Rule
Compare each column left → right. **Higher = wins.**
```
#main .text p   → 0,1,1,1
.container p    → 0,0,1,1   ← loses (# beats class)
```

### ⚠️ `!important`
```css
p { color: red !important; }
```
Overrides everything except another `!important` with higher specificity. **Use sparingly!**

---

## Quick Reference Card

```css
/* External file: styles.css */
* { box-sizing: border-box; }     /* Reset */

#nav { background: #333; }        /* ID */
.btn { padding: 8px 16px; }       /* Class */
a:hover { text-decoration: none; }/* Pseudo */

/* Comment */
```

**Priority (high → low):**
`!important` → Inline → ID → Class/Attr → Element → `*`