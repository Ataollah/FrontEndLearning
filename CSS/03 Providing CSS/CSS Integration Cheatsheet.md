# CSS Integration Cheatsheet

## 1. Linking External Stylesheet (link tag) ⭐ **RECOMMENDED**

**Syntax:**
```html
<head>
  <link rel="stylesheet" href="styles.css">
  <!-- With media query -->
  <link rel="stylesheet" href="print.css" media="print">
  <link rel="stylesheet" href="mobile.css" media="(max-width: 600px)">
</head>
```

**Best Practices:**
- Place in `<head>` before other content
- Use `rel="stylesheet"` (required)
- Use `media` attribute for conditional loading
- Add `preload` for critical CSS:
```html
<link rel="preload" href="critical.css" as="style">
```

**Pros:** ✅ Cacheable, reusable, separation of concerns, parallel downloads
**Cons:** ❌ Extra HTTP request

---

## 2. @import Rule ⚠️ **AVOID**

**Syntax:**
```css
/* Inside a CSS file (top only) */
@import url("base.css");
@import "typography.css" screen;
@import url("print.css") print;

/* Inside <style> tag */
<style>
  @import url("styles.css");
</style>
```

**Why to AVOID:**
- 🐌 **Blocks rendering** — browser must download parent CSS first, then discover imports (waterfall effect)
- 🔗 **Serial downloads** — no parallel loading
- 📉 **Hurts performance** — slower first paint
- 🎯 **No preload support** — can't hint the browser
- 📦 **Makes bundling harder**

**When it's OK:** Rarely — maybe for splitting large CSS in dev, but use a bundler instead.

**Better alternative:**
```html
<link rel="stylesheet" href="base.css">
<link rel="stylesheet" href="typography.css">
```

---

## 3. Embedding Styles in HTML (`<style>` tag)

**Syntax:**
```html
<head>
  <style>
    body { font-family: sans-serif; }
    .btn { background: blue; color: white; }
  </style>
</head>
```

**Use Cases:**
- **Critical CSS** — inline above-the-fold styles for fast first paint
- **Single-page sites** — small projects
- **Email HTML** — many clients strip external CSS
- **Component styles** — in frameworks (though scoped variants preferred)
- **Per-page overrides**

**Pros:** ✅ No extra HTTP request, no FOUC
**Cons:** ❌ Not cacheable across pages, bloats HTML, hard to maintain at scale

---

## 4. Inline Styles (style attribute)

**Syntax:**
```html
<p style="color: red; font-size: 16px;">Text</p>
```

**When to Use:**
- ✅ **Dynamic values from JS** (e.g., `el.style.width = x + 'px'`)
- ✅ **Email HTML** (many clients require it)
- ✅ **Quick prototypes / debugging**
- ✅ **CSS custom properties** for theming:
  ```html
  <div style="--brand: #f00">…</div>
  ```
- ✅ **Third-party widget isolation**

**Avoid When:**
- ❌ Normal styling (use classes instead)
- ❌ You need `:hover`, `:focus`, media queries, pseudo-elements
- ❌ Maintainability matters (highest specificity → hard to override)

**Specificity note:** Inline styles beat all selectors except `!important`.

---

## Quick Decision Table

| Method | Cacheable | Reusable | Specificity | Best For |
|---|---|---|---|---|
| `<link>` | ✅ | ✅ | Normal | **Default choice** |
| `@import` | ✅ | ✅ | Normal | ❌ Avoid |
| `<style>` | ❌ | Per-page | Normal | Critical CSS, email |
| `style=""` | ❌ | ❌ | Highest | JS, email, prototypes |

## Priority Order (Cascade)
```
1. Inline styles        (highest)
2. <style> / <link>     (by specificity/order)
3. @import'd styles     (treated as if written at import location)
4. User agent defaults  (lowest)
```

## Golden Rules
1. **Prefer `<link>`** for external stylesheets
2. **Never use `@import`** in production
3. **Inline only critical CSS** in `<style>`
4. **Reserve inline styles** for dynamic/JS-driven values
5. **Bundle & minify** CSS with a build tool (Vite, Webpack, etc.)