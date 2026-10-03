# CSS Measurement Units Cheatsheet

## 1. Absolute Units

These are fixed and don't change based on other elements or viewport.

| Unit | Name | Equivalent |
|------|------|------------|
| `px` | Pixels | 1/96th of an inch (CSS reference) |
| `pt` | Points | 1pt = 1.333px (1/72 inch) |
| `pc` | Picas | 1pc = 16px (12pt) |
| `cm` | Centimeters | 1cm ≈ 37.8px |
| `mm` | Millimeters | 1mm ≈ 3.78px |
| `in` | Inches | 1in = 96px |

```css
.box {
  width: 300px;
  border: 1pt solid black;   /* print-friendly */
  margin: 1cm;
  padding: 5mm;
  height: 2in;
}
```

> **Use absolute units** for print stylesheets, borders, and fixed UI elements. Avoid `px` for font sizes if you want accessibility (users can't zoom text easily).

---

## 2. Relative Units

Sized relative to something else — parent, root, or viewport.

| Unit | Relative To |
|------|-------------|
| `%` | Parent element's corresponding property |
| `em` | Parent's (or own for font-size) computed font size |
| `rem` | Root (`<html>`) font size (usually 16px) |
| `vw` | 1% of viewport width |
| `vh` | 1% of viewport height |
| `vmin` | 1% of the smaller viewport dimension |
| `vmax` | 1% of the larger viewport dimension |

```css
.container {
  width: 80%;          /* 80% of parent width */
  font-size: 1.5rem;   /* 1.5 × root font size */
  padding: 2em;        /* 2 × current font size */
  height: 100vh;       /* full viewport height */
  min-height: 50vmin;  /* 50% of smaller viewport side */
}
```

**Viewport rules of thumb:**
- `vw/vh` — great for hero sections, full-screen layouts
- `vmin` — for elements that must fit both orientations (e.g., logos)
- `vmax` — for elements that should always overflow slightly

---

## 3. em vs rem — When to Use Each

### `em` — Relative to **parent's** font size (compounds!)

```css
.parent { font-size: 16px; }
.child  { font-size: 2em; }   /* = 32px */
.grandchild { font-size: 2em; } /* = 64px (compounds!) */
```

### `rem` — Relative to **root** font size (predictable)

```css
html { font-size: 16px; }
.box { font-size: 2rem; }  /* always 32px regardless of nesting */
```

### Decision Guide

| Use Case | Recommended |
|----------|-------------|
| Global font sizing, spacing scale | `rem` |
| Component padding that scales with its text | `em` |
| Media queries | `em` (respects user zoom) |
| Button padding that scales with button text | `em` |
| Nested components you want independent | `rem` |

```css
/* Classic pattern: em for local scaling */
.btn {
  font-size: 1rem;
  padding: 0.5em 1em;   /* scales if font-size changes */
  border-radius: 0.25em;
}
.btn--large { font-size: 1.5rem; } /* padding scales automatically */
```

**Tip:** Set `html { font-size: 62.5%; }` so `1rem = 10px` — makes mental math easy (`1.6rem = 16px`).

---

## 4. `ch` Unit — Character Width

Equal to the width of the `0` (zero) glyph in the current font.

```css
.article {
  max-width: 65ch;  /* ~65 characters per line — ideal readability */
}

.input-short {
  width: 10ch;      /* fits ~10 characters */
}
```

**Best for:**
- Line length (`45ch`–`75ch` = optimal reading)
- Input widths sized to expected content
- Monospace-friendly layouts

---

## 5. `ex` Unit — x-height

Equal to the height of the lowercase `x` in the current font.

```css
.superscript {
  vertical-align: 0.5ex;
  font-size: 0.75em;
}
```

**Best for:** fine typographic adjustments, sub/superscript alignment.

> Less commonly used than `ch`; `ex` varies heavily between fonts.

---

## 6. `calc()` — Dynamic Calculations

Mix units and perform math in CSS.

```css
.sidebar {
  width: calc(100% - 250px);   /* mix % and px */
}

.full-height {
  height: calc(100vh - 60px);  /* account for header */
}

.fluid-type {
  font-size: calc(1rem + 1vw); /* responsive scaling */
}
```

**Rules:**
- Spaces **required** around `+` and `-`
- `*` and `/` don't need spaces
- Can nest: `calc(100% - calc(20px + 1em))`
- Can combine with custom properties: `calc(var(--gap) * 2)`

```css
:root { --header: 80px; }

main {
  min-height: calc(100vh - var(--header));
}
```

---

## 7. `min()`, `max()`, `clamp()`

### `min()` — picks the smallest value
```css
.box {
  width: min(500px, 90%);  /* never exceeds 90% of parent */
}
```

### `max()` — picks the largest value
```css
.box {
  width: max(300px, 50%);  /* at least 300px */
}
```

### `clamp(min, preferred, max)` — the sweet spot
```css
h1 {
  font-size: clamp(1.5rem, 4vw, 3rem);
  /* min 1.5rem, scales with 4vw, capped at 3rem */
}

.container {
  width: clamp(320px, 90%, 1200px);
}
```

**Fluid typography pattern:**
```css
body {
  font-size: clamp(16px, 1rem + 0.5vw, 20px);
}
```

---

## Quick Reference Table

| Need | Use |
|------|-----|
| Consistent global sizing | `rem` |
| Component-relative sizing | `em` |
| Full-viewport layouts | `vh` / `vw` |
| Fit both orientations | `vmin` |
| Readable line length | `ch` |
| Mix units in one value | `calc()` |
| Responsive with bounds | `clamp()` |
| Never exceed / never below | `min()` / `max()` |
| Print styles | `pt`, `cm`, `mm`, `in` |

---

## Common Gotchas

- ⚠️ `%` height needs a defined parent height
- ⚠️ `em` **compounds** in nested elements — the #1 source of sizing bugs
- ⚠️ `vw` causes horizontal scroll if used as `width: 100vw` (scrollbar)
- ⚠️ `100vh` on mobile browsers can overflow (use `dvh`/`svh`/`lvh` where supported)
- ⚠️ `calc()` requires spaces around `+` and `-`
- ⚠️ `ch` assumes the font's `0` width — not equal for all characters