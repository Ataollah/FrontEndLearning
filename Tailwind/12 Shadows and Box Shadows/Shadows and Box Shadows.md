# Shadows and Box Shadows in Tailwind CSS

Tailwind provides two related but distinct utilities for adding depth to elements:

## 1. `box-shadow` (Tailwind's `shadow-*` utilities)

This is the classic CSS `box-shadow` — a shadow drawn **outside (or inside) the element's box**, following its border-box shape. In Tailwind, these are exposed as `shadow-*` classes.

### Basic Usage

```html
<div class="shadow-sm">Small shadow</div>
<div class="shadow">Default shadow</div>
<div class="shadow-md">Medium shadow</div>
<div class="shadow-lg">Large shadow</div>
<div class="shadow-xl">Extra large shadow</div>
<div class="shadow-2xl">Huge shadow</div>
<div class="shadow-none">No shadow</div>
```

### Colored Shadows (v3+)

```html
<div class="shadow-lg shadow-blue-500/50">Blue-tinted shadow</div>
<div class="shadow-md shadow-red-500">Red shadow</div>
<div class="shadow-xl shadow-cyan-500/50">Cyan translucent shadow</div>
```

### Inset Shadows

Use the `inset` modifier to place the shadow **inside** the element:

```html
<div class="shadow-inner">Inner shadow</div>
<div class="shadow-lg shadow-inner">Large inset shadow</div>
```

> Note: In Tailwind v3, `shadow-inner` is a separate utility. In v4, use `inset-shadow-*`.

### Custom Shadows

**Tailwind v3** — extend in `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      boxShadow: {
        'custom': '0 4px 14px 0 rgba(0, 118, 255, 0.39)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
      }
    }
  }
}
```

```html
<div class="shadow-custom">Custom shadow</div>
```

**Tailwind v4** — define in CSS with `@theme`:

```css
@theme {
  --shadow-custom: 0 4px 14px 0 rgba(0, 118, 255, 0.39);
  --shadow-glow: 0 0 20px rgba(59, 130, 246, 0.5);
}
```

---

## 2. `text-shadow` (v4.1+)

This is **not a box shadow** — it applies shadows directly to text glyphs. Tailwind added first-party support in **v4.1**.

```html
<h1 class="text-shadow-sm">Small text shadow</h1>
<h1 class="text-shadow-md">Medium text shadow</h1>
<h1 class="text-shadow-lg">Large text shadow</h1>
<h1 class="text-shadow-none">No text shadow</h1>
```

### Colored Text Shadows

```html
<h1 class="text-shadow-lg text-shadow-blue-500/50">Tinted glow</h1>
```

### Custom via CSS

```css
@theme {
  --text-shadow-glow: 0 0 8px rgba(255, 200, 0, 0.8);
}
```

```html
<h1 class="text-shadow-glow">Glowing text</h1>
```

---

## 3. Drop Shadow (`drop-shadow-*`)

A third, often-confused utility. It maps to the CSS `filter: drop-shadow()` function and follows the **alpha shape of the element** — useful for SVGs and PNGs with transparency.

```html
<img src="logo.svg" class="drop-shadow-md" />
<svg class="drop-shadow-lg">...</svg>
```

| Utility | CSS Property | Follows Element Shape? |
|---|---|---|
| `shadow-*` | `box-shadow` | No — follows the rectangular box |
| `drop-shadow-*` | `filter: drop-shadow()` | Yes — follows the visible pixels |
| `text-shadow-*` | `text-shadow` | Applies to the text glyphs |

---

## Quick Comparison Cheat Sheet

| Class family | Applies to | Best for |
|---|---|---|
| `shadow-sm/md/lg/xl/2xl` | Box | Cards, buttons, modals, elevation |
| `shadow-inner` / `inset-shadow-*` | Box (inside) | Pressed buttons, input wells |
| `shadow-{color}` | Box | Branded elevation |
| `text-shadow-*` | Text glyphs | Titles, hero text, neon effects |
| `drop-shadow-*` | Element's alpha silhouette | SVG icons, transparent PNGs |

---

## Common Gotcha: Stacking Colors on Box Shadows

```html
<!-- ✅ Correct: color overrides shadow's color, blur stays -->
<div class="shadow-xl shadow-indigo-500/40">...</div>

<!-- ❌ Wrong: shadow-indigo replaces the shadow size entirely -->
<div class="shadow-indigo shadow-xl">...</div>
```

The color utility must come *after* the size utility and only sets the `--tw-shadow-color` variable — it doesn't redefine the shadow's geometry.