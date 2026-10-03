# Customizing Theme in Tailwind CSS v4 (Colors, Fonts, Screens)

Tailwind v4's power lies in its **CSS-first configuration**. The `@theme` directive in your CSS file is where you customize the design system — colors, fonts, breakpoints, spacing, and more. No more `tailwind.config.js` required.

---

## 1. The CSS Entry Point

Install and import:

```bash
npm install tailwindcss @tailwindcss/vite
```

```css
/* app.css */
@import "tailwindcss";
```

**Key concept:**

- `@theme { ... }` → **defines** design tokens that generate utilities _and_ CSS variables
- `@theme inline { ... }` → tokens that reference other variables (resolved at use site)
- `@theme static { ... }` → always emit all variables, even if unused
- Tokens are exposed as CSS variables (`--color-*`, `--font-*`, etc.)

> Legacy `tailwind.config.js` still works via `@config "./tailwind.config.js";`

---

## 2. Customizing Colors

### Adding colors

```css
@import "tailwindcss";

@theme {
  --color-brand-50: oklch(0.97 0.02 250);
  --color-brand-100: oklch(0.93 0.04 250);
  --color-brand-500: oklch(0.62 0.19 250);
  --color-brand-900: oklch(0.32 0.12 250);

  --color-brand-primary: #ff6b6b; /* single value */
}
```

Usage: `bg-brand-500`, `text-brand-900`, `border-brand-primary`

### Overriding colors entirely

```css
@theme {
  --color-*: initial; /* wipe all default colors */
  --color-white: #ffffff;
  --color-black: #000000;
  /* only these remain */
}
```

### Referencing other theme values

```css
@theme {
  --color-primary: var(--color-blue-500);
  --color-danger: var(--color-red-500);
}
```

Or import defaults:

```css
@import "tailwindcss/theme.css" theme(reference);
```

---

## 3. Customizing Fonts

### Font families

```css
@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Playfair Display", serif;
  --font-mono: "Fira Code", ui-monospace, monospace;
}
```

Usage: `font-sans`, `font-display`, `font-mono`

### Font sizes (with modifiers)

In v4, font-size line-height/letter-spacing/weight are separate tokens:

```css
@theme {
  --text-tiny: 0.625rem; /* 10px */

  --text-huge: 4rem;
  --text-huge--line-height: 1.1;
  --text-huge--letter-spacing: -0.02em;
  --text-huge--font-weight: 700;
}
```

Usage: `text-tiny`, `text-huge`

### Font weights, spacing, etc.

```css
@theme {
  --font-weight-black: 900;
  --font-weight-heavy: 950;

  --tracking-tightest: -0.075em;
}
```

---

## 4. Customizing Screens (Breakpoints)

### Adding breakpoints

```css
@theme {
  --breakpoint-xs: 30rem; /* 480px */
  --breakpoint-tablet: 40rem;
  --breakpoint-3xl: 120rem; /* 1920px */
}
```

Usage: `xs:flex`, `3xl:grid-cols-6`, `tablet:block`

### Custom variants (arbitrary media queries)

```css
@custom-variant portrait (@media (orientation: portrait));
@custom-variant print (@media print);
@custom-variant pointer-coarse (@media (pointer: coarse));
```

Usage: `portrait:block`, `print:hidden`, `pointer-coarse:p-4`

### Range syntax (min/max)

```css
@custom-variant sm-only (@media (width >= 40rem) and (width < 48rem));
@custom-variant md-max  (@media (width < 48rem));
```

### Overriding breakpoints (mobile-first order matters)

```css
@theme {
  --breakpoint-*: initial;
  --breakpoint-sm: 40rem;
  --breakpoint-md: 48rem;
  --breakpoint-lg: 64rem;
  --breakpoint-xl: 80rem;
}
```

---

## 5. Other Useful Theme Customizations

```css
@theme {
  --spacing-128: 32rem;
  --spacing-144: 36rem;

  --radius-4xl: 2rem;

  --shadow-glow: 0 0 20px oklch(0.62 0.19 250 / 0.5);

  --animate-spin-slow: spin 3s linear infinite;
  --animate-wiggle: wiggle 1s ease-in-out infinite;

  @keyframes wiggle {
    0%,
    100% {
      transform: rotate(-3deg);
    }
    50% {
      transform: rotate(3deg);
    }
  }
}
```

---

## 6. Reusable Theme Values in CSS

Every `@theme` token becomes a CSS variable automatically:

```css
.custom-btn {
  background: var(--color-brand-500);
  font-family: var(--font-display);
  padding: calc(var(--spacing) * 4);
  border-radius: var(--radius-4xl);
}

@media (width >= 64rem) {
  .custom-btn {
    padding: calc(var(--spacing) * 8);
  }
}
```

Or use the `theme()` function (still supported):

```css
.custom-btn {
  background: theme(--color-brand-500);
  font-family: theme(--font-display);
  padding: theme(--spacing-4);
}
```

---

## 7. Best Practices

| Do                                                         | Don't                                         |
| ---------------------------------------------------------- | --------------------------------------------- |
| Extend tokens via `@theme`                                 | Manually write CSS variables in `:root`       |
| Wipe defaults only when intentional (`--color-*: initial`) | Forget `initial` and ship 200 unused colors   |
| Group related colors (`--color-brand-50…900`)              | Hard-code hex values in markup                |
| Use semantic names (`--color-primary`, `--color-danger`)   | Rely on `blue-500` everywhere                 |
| Keep breakpoints mobile-first (small → large)              | Declare breakpoints out of order              |
| Prefer `@custom-variant` for one-off media queries         | Reinvent selectors with raw `@media`          |
| Use `@theme inline` for tokens referencing other vars      | Nest `var()` inside `@theme` without `inline` |

---

## 8. v3 → v4 Migration Cheatsheet

| v3 (`tailwind.config.js`)              | v4 (`@theme` in CSS)                                                    |
| -------------------------------------- | ----------------------------------------------------------------------- |
| `theme.extend.colors.brand.500`        | `--color-brand-500`                                                     |
| `theme.extend.fontFamily.display`      | `--font-display`                                                        |
| `theme.extend.fontSize.huge`           | `--text-huge` + `--text-huge--line-height`                              |
| `theme.extend.spacing.128`             | `--spacing-128`                                                         |
| `theme.extend.screens.3xl`             | `--breakpoint-3xl`                                                      |
| `theme.extend.animation.spin-slow`     | `--animate-spin-slow`                                                   |
| `theme.extend.keyframes.wiggle`        | `@keyframes wiggle` inside `@theme`                                     |
| `theme.colors = { ... }` (override)    | `--color-*: initial;` then redefine                                     |
| `theme('colors.brand.500')`            | `var(--color-brand-500)` or `theme(--color-brand-500)`                  |
| `screens: { 'sm-only': { min, max } }` | `@custom-variant sm-only (@media (width >= 40rem) and (width < 48rem))` |

---

### TL;DR

- **Colors/Fonts/Screens** are defined with `--color-*`, `--font-*`, `--breakpoint-*` inside `@theme { }`
- Each token auto-generates utilities **and** a CSS variable
- Wipe defaults with `--token-*: initial` when you want full control
- Use `@custom-variant` for arbitrary/range media queries and new variants
- `tailwind.config.js` is optional — use `@config` for backwards compat
- Consume tokens in CSS via `var(--token)` or `theme(--token)`
