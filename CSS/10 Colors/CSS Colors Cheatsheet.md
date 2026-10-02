# CSS Colors Cheatsheet

## 1. Color Names (Predefined)
147 named colors + `transparent` + `currentColor`.

```css
color: red;
color: tomato;
color: rebeccapurple;
color: transparent;      /* fully transparent */
color: currentColor;     /* inherits current color value */
```

**Common names:** `black`, `white`, `red`, `green`, `blue`, `yellow`, `orange`, `purple`, `pink`, `gray/grey`, `silver`, `gold`, `navy`, `teal`, `lime`, `aqua`, `fuchsia`, `maroon`, `olive`, `coral`, `salmon`, `crimson`, `indigo`, `violet`, `turquoise`, `beige`, `ivory`, `khaki`, `lavender`, `plum`, `orchid`, `chocolate`, `tan`.

---

## 2. Hexadecimal

| Format | Example | Notes |
|---|---|---|
| `#RGB` | `#f00` | Shorthand — each digit doubled (`#ff0000`) |
| `#RRGGBB` | `#ff0000` | Standard |
| `#RGBA` | `#f008` | Shorthand + alpha |
| `#RRGGBBAA` | `#ff000080` | Alpha channel (0–FF) |

```css
color: #ff0000;        /* red */
color: #f00;           /* red */
color: #ff000080;      /* 50% transparent red */
background: #1a1a1a;
```

---

## 3. RGB / RGBA

```css
color: rgb(255, 0, 0);              /* red */
color: rgb(255 0 0);                /* modern space-separated */
color: rgba(255, 0, 0, 0.5);        /* 50% transparent */
color: rgb(255 0 0 / 0.5);          /* modern syntax */
color: rgb(100% 0% 0%);             /* percentages */
```

- Channels: `0–255` or `0%–100%`
- Alpha: `0–1` (or `0%–100%`)
- `rgba()` is now an alias for `rgb()` — both accept alpha.

---

## 4. HSL / HSLA

**H**ue `0–360` · **S**aturation `0%–100%` · **L**ightness `0%–100%`

```css
color: hsl(0, 100%, 50%);           /* red */
color: hsl(0 100% 50%);             /* modern syntax */
color: hsla(0, 100%, 50%, 0.5);     /* 50% transparent */
color: hsl(0 100% 50% / 0.5);       /* modern syntax */
```

**Hue wheel:** 0°=red, 60°=yellow, 120°=green, 180°=cyan, 240°=blue, 300°=magenta.

**Tip:** HSL makes it easy to create tints/shades by adjusting `L` and `S`.

---

## 5. currentColor

Refers to the computed value of the element's `color` property.

```css
button {
  color: teal;
  border: 2px solid currentColor;   /* teal border */
  box-shadow: 0 0 4px currentColor; /* teal glow */
}
```

- Great for theming and icon SVGs (`fill: currentColor`).
- Keeps child elements in sync with text color automatically.

---

## 6. Color Contrast & Accessibility

**WCAG contrast ratio** = relative luminance comparison between text & background.

| Level | Normal text | Large text (≥18.66px bold or ≥24px) |
|---|---|---|
| AA | ≥ 4.5:1 | ≥ 3:1 |
| AAA | ≥ 7:1 | ≥ 4.5:1 |
| UI components (AA) | ≥ 3:1 | — |

```css
/* Respect user's OS-level preferences */
@media (prefers-contrast: more) {
  .text { color: #000; background: #fff; }
}

@media (prefers-color-scheme: dark) {
  body { background: #121212; color: #eee; }
}

/* Force colors in high-contrast / forced-colors mode */
@media (forced-colors: active) {
  .button { border: 1px solid ButtonText; }
}
```

**Tips**
- Don't rely on color alone to convey meaning (add icons/text).
- Test with tools: WebAIM Contrast Checker, axe DevTools, Lighthouse.
- Prefer near-black (`#121212`) over pure black on dark UIs to reduce halation.
- Ensure focus indicators have ≥ 3:1 contrast.

---

## 7. Modern Color Functions (Brief)

### `color-mix()`
Blends two colors in a given color space.

```css
color: color-mix(in srgb, red 40%, blue);
/* 40% red + 60% blue */

background: color-mix(in oklch, var(--brand) 20%, white); /* tint */
```

Spaces: `srgb`, `srgb-linear`, `lab`, `lch`, `oklab`, `oklch`, `hsl`, `xyz`.

### Relative Colors (`from`)
Derive a new color from an existing one using channel math.

```css
color: rgb(from red r g b / 0.5);           /* same red, 50% alpha */
color: hsl(from var(--brand) h s calc(l * 1.2)); /* lighten */
color: oklch(from #3498db l c calc(h + 180));    /* complementary */
```

Keyword `from` + origin color + channel expressions (r/g/b, h/s/l, l/c/h, etc.).

### Other Modern Additions
- `hwb()` — hue/whiteness/blackness
- `lab()`, `lch()`, `oklab()`, `oklch()` — perceptually uniform
- `color()` — explicit color space (e.g., `color(display-p3 1 0 0)`)
- `light-dark(light, dark)` — responds to `color-scheme`

```css
:root { color-scheme: light dark; }
body { background: light-dark(#fff, #111); }
```

---

## Quick Reference Table

| Syntax | Example | Alpha? |
|---|---|---|
| Named | `red`, `tomato` | ✗ |
| Hex | `#f00`, `#ff0000`, `#ff000080` | via `#RRGGBBAA` |
| `rgb()` / `rgba()` | `rgb(255 0 0 / .5)` | ✓ |
| `hsl()` / `hsla()` | `hsl(0 100% 50% / .5)` | ✓ |
| `hwb()` | `hwb(0 0% 0%)` | ✓ |
| `lab()`, `lch()` | `lab(50% 40 30)` | ✓ |
| `oklab()`, `oklch()` | `oklch(0.7 0.15 200)` | ✓ |
| `color()` | `color(display-p3 1 0 0)` | ✓ |
| `color-mix()` | `color-mix(in srgb, red, blue)` | inherited |
| Relative | `rgb(from red r g b / .5)` | ✓ |
| `currentColor` | inherits `color` | inherited |
| `transparent` | = `rgb(0 0 0 / 0)` | ✓ |