# Customizing Theme in Tailwind CSS (Colors, Fonts, Screens)

Tailwind's power lies in its **configurability**. The `tailwind.config.js` file is where you customize the design system — colors, fonts, breakpoints, spacing, and more.

---

## 1. The Config File

Generate it with:

```bash
npx tailwindcss init
```

Basic structure:

```js
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {},   // add to defaults
    // ...or override defaults directly
  },
  plugins: [],
}
```

**Key concept:**
- `theme: { ... }` → **overrides** Tailwind defaults
- `theme: { extend: { ... } }` → **adds** to defaults (usually what you want)

---

## 2. Customizing Colors

### Adding colors

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        'brand-primary': '#ff6b6b',  // single value
      },
    },
  },
}
```

Usage: `bg-brand-500`, `text-brand-900`, `border-brand-primary`

### Overriding colors entirely

```js
theme: {
  colors: {
    white: '#ffffff',
    black: '#000000',
    // all default colors are now GONE
  },
}
```

### Referencing theme values

```js
const colors = require('tailwindcss/colors')

theme: {
  extend: {
    colors: {
      primary: colors.blue,
      danger: colors.red[500],
    },
  },
}
```

---

## 3. Customizing Fonts

### Font families

```js
const defaultTheme = require('tailwindcss/defaultTheme')

theme: {
  extend: {
    fontFamily: {
      sans: ['Inter', ...defaultTheme.fontFamily.sans],
      display: ['"Playfair Display"', 'serif'],
      mono: ['"Fira Code"', 'monospace'],
    },
  },
}
```

Usage: `font-sans`, `font-display`, `font-mono`

### Font sizes

```js
theme: {
  extend: {
    fontSize: {
      'tiny': '0.625rem',           // 10px
      'huge': ['4rem', {             // [size, options]
        lineHeight: '1.1',
        letterSpacing: '-0.02em',
        fontWeight: '700',
      }],
    },
  },
}
```

Usage: `text-tiny`, `text-huge`

### Font weights, spacing, etc.

```js
theme: {
  extend: {
    fontWeight: { black: '900', heavy: '950' },
    letterSpacing: { tightest: '-.075em' },
  },
}
```

---

## 4. Customizing Screens (Breakpoints)

### Adding breakpoints

```js
theme: {
  extend: {
    screens: {
      'xs':  '475px',
      '3xl': '1920px',
      'tablet': '640px',
      'print': { 'print': true },        // media query
      'portrait': { 'raw': '(orientation: portrait)' },
    },
  },
}
```

Usage: `xs:flex`, `3xl:grid-cols-6`, `portrait:block`

### Overriding breakpoints (mobile-first order matters)

```js
theme: {
  screens: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
}
```

### Range syntax (Tailwind v3.2+)

```js
screens: {
  'sm-only': { min: '640px', max: '767px' },
  'md-max':  { max: '767px' },
}
```

---

## 5. Other Useful Theme Customizations

```js
theme: {
  extend: {
    spacing: {
      '128': '32rem',
      '144': '36rem',
    },
    borderRadius: {
      '4xl': '2rem',
    },
    boxShadow: {
      'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
    },
    animation: {
      'spin-slow': 'spin 3s linear infinite',
    },
    keyframes: {
      wiggle: {
        '0%, 100%': { transform: 'rotate(-3deg)' },
        '50%':      { transform: 'rotate(3deg)' },
      },
    },
  },
}
```

---

## 6. Reusable Theme Values via `theme()`

In CSS files you can pull values from the config:

```css
.custom-btn {
  background: theme('colors.brand.500');
  font-family: theme('fontFamily.display');
  padding: theme('spacing.4');
}

/* Media query from screens */
@media (min-width: theme('screens.lg')) {
  .custom-btn { padding: theme('spacing.8'); }
}
```

---

## 7. Best Practices

| Do | Don't |
|---|---|
| Use `extend` to keep defaults | Override `theme` unless intentional |
| Group related colors (e.g. `brand.50–900`) | Hard-code hex values in markup |
| Use semantic names (`primary`, `danger`) | Rely on `blue-500` everywhere |
| Keep breakpoints mobile-first (small → large) | Skip breakpoints in order |
| Import `defaultTheme` when extending fonts | Lose fallback fonts |

---

## 8. Tailwind v4 Note

In **Tailwind v4** (2025+), configuration moved largely to CSS:

```css
@import "tailwindcss";

@theme {
  --color-brand-500: #3b82f6;
  --font-display: "Playfair Display", serif;
  --breakpoint-3xl: 1920px;
}
```

The `tailwind.config.js` file is optional but still supported via `@config`.

---

### TL;DR
- **Colors/Fonts/Screens** live under `theme.extend` in `tailwind.config.js`
- Use `extend` to **add**, use `theme` root to **replace**
- Reference defaults via `tailwindcss/defaultTheme` and `tailwindcss/colors`
- Consume values in CSS via `theme('path.to.value')`