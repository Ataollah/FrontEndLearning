# Advanced CSS Features (Modern)

## 1. CSS Variables (Custom Properties)

CSS variables, officially called **custom properties**, let you store reusable values in one place and reference them throughout your stylesheet. They're a native CSS feature (no preprocessor like Sass needed).

### Basic Syntax

```css
:root {
  --primary-color: #3498db;
  --spacing: 16px;
}

.button {
  background-color: var(--primary-color);
  padding: var(--spacing);
}
```

- **Declaration**: `--variable-name: value;` (must start with `--`)
- **Usage**: `var(--variable-name)`
- `:root` is the `<html>` element — a common place to define global variables.

### Why They're Powerful

Unlike Sass variables (which are compile-time), CSS variables are **live in the browser**. They:

- **Cascade and inherit** — a child can override a parent's value
- **Can be changed at runtime** — via JavaScript, media queries, or pseudo-classes
- **Can be scoped** — to any selector, not just global

### Scoping & Inheritance Example

```css
:root {
  --theme-color: blue;
}

.card {
  --theme-color: green;   /* only affects .card and its children */
  border: 2px solid var(--theme-color);
}

.card .title {
  color: var(--theme-color);  /* inherits green */
}
```

### Fallback Values

`var()` accepts a second argument as a fallback if the variable is undefined:

```css
color: var(--text-color, black);
```

### Runtime Theming

```css
:root { --bg: white; --text: black; }

.dark-mode {
  --bg: #111;
  --text: #eee;
}

body {
  background: var(--bg);
  color: var(--text);
}
```

Just toggling a class instantly re-themes the whole page.

---

## 2. Using CSS Variables with `calc()`

`calc()` lets you perform **math with mixed units** (e.g., `%` + `px`). Combining it with variables unlocks dynamic, responsive layouts.

### Basic Combination

```css
:root {
  --base-size: 16px;
  --scale: 1.5;
}

.heading {
  font-size: calc(var(--base-size) * var(--scale)); /* 24px */
}
```

### Common Use Cases

**Fluid spacing / sizing**
```css
:root {
  --gap: 8px;
}

.grid {
  gap: calc(var(--gap) * 2);
  padding: calc(var(--gap) * 1.5);
}
```

**Responsive layout without media queries**
```css
:root {
  --sidebar-width: 250px;
}

.main {
  width: calc(100% - var(--sidebar-width));
}
```

**Dynamic font scaling**
```css
:root {
  --min-font: 14px;
  --max-font: 22px;
}

.text {
  font-size: clamp(var(--min-font), 2vw, var(--max-font));
}
```

**Combining multiple variables**
```css
:root {
  --spacing-unit: 4px;
}

.box {
  padding: calc(var(--spacing-unit) * 3);
  margin: calc(var(--spacing-unit) * 2 + 10px);
}
```

### ⚠️ Important Rules & Gotchas

1. **Unitless values must be unitless for multiplication.**
   ```css
   --scale: 1.5;                         /* ✅ number */
   font-size: calc(16px * var(--scale)); /* ✅ works */
   ```
   You can't multiply `16px * 1.5px` — that's invalid.

2. **Whitespace around `+` and `-` is required.**
   ```css
   calc(100% - var(--x))   /* ✅ */
   calc(100%-var(--x))     /* ❌ broken */
   ```
   (Not required around `*` and `/`, but recommended for readability.)

3. **Variables are resolved before `calc()` runs** — so even if a variable holds a full expression, it works:
   ```css
   :root { --expr: 10px + 5px; }
   width: calc(var(--expr) * 2);  /* 30px */
   ```

4. **Can't nest `calc()` incorrectly** — `calc()` inside `calc()` is allowed, but you don't need it since variables expand inline.

5. **Fallbacks work inside calc too:**
   ```css
   width: calc(100% - var(--sidebar, 200px));
   ```

---

## Quick Comparison: Variables vs Preprocessor Variables

| Feature | CSS Variables | Sass/Less Variables |
|---|---|---|
| Resolved at | Runtime (browser) | Compile time |
| Cascade / inherit | ✅ Yes | ❌ No |
| Changeable via JS | ✅ Yes | ❌ No |
| Works in media queries | ✅ Yes | ⚠️ Limited |
| Can be scoped per element | ✅ Yes | ❌ Global only |

---

## Putting It All Together

```css
:root {
  --brand: #6c5ce7;
  --radius: 8px;
  --space: 12px;
  --scale: 1.25;
}

.card {
  background: var(--brand);
  border-radius: var(--radius);
  padding: calc(var(--space) * 2);
  font-size: calc(1rem * var(--scale));
  width: calc(100% - var(--space));
  transition: background 0.3s;
}

.card:hover {
  --brand: #a29bfe;   /* scoped override on hover */
}
```

This pattern — a small set of tunable variables, composed with `calc()` — is the backbone of modern, maintainable CSS (and design systems).