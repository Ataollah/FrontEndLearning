In Tailwind CSS v4, the traditional `tailwind.config.js` file is no longer automatically detected. The primary way to configure Tailwind has shifted to a **CSS-first approach** using the `@theme` directive. However, a legacy JavaScript config file can still be used for backward compatibility.

### 📁 CSS-First Configuration (The New Default)

The core of Tailwind v4 configuration is now your main CSS file (e.g., `app.css`). You no longer need a separate JavaScript file for theme customization.

The most important directive is `@theme`, which defines your design tokens as CSS custom properties. These variables automatically generate the corresponding utility classes.

**Example of a CSS-first configuration:**

```css
@import "tailwindcss";

@theme {
  /* Custom Colors */
  --color-brand: #3b82f6;
  --color-surface: oklch(0.98 0 0);

  /* Custom Fonts */
  --font-display: "Satoshi", sans-serif;

  /* Custom Spacing */
  --spacing-section: 4rem;

  /* Custom Breakpoints */
  --breakpoint-3xl: 120rem;
}
```

This configuration would generate utilities like `bg-brand`, `text-surface`, `font-display`, and the `3xl:` breakpoint variant.

### 🧩 Key Directives in the CSS File

Beyond `@theme`, other important directives replace the functionality of the old JavaScript config:

- **`@source`**: Replaces the `content` array. Tailwind v4 automatically detects your project files, but you can use this directive to add specific paths for scanning (like a UI library in `node_modules`) or to explicitly safelist classes.
- **`@utility`**: Replaces the need for custom CSS in `@layer components` or `@layer utilities`. It allows you to create custom utility classes that work with variants like `hover:` and `md:`.
- **`@custom-variant`**: Allows you to create your own variants (e.g., for a specific theme or direction).
- **`@plugin`**: Used to load JavaScript-based plugins.

### 🔄 Using a Legacy `tailwind.config.js` File

If you have an existing `tailwind.config.js` file or need to use a preset, you can still use it, but you must load it explicitly in your CSS file using the `@config` directive.

```css
@import "tailwindcss";

/* Load your legacy config file */
@config "./tailwind.config.js";
```

**Important**: When using a JavaScript config, the values defined in your `@theme` block will override any conflicting values from the JS file. Also, some options like `corePlugins`, `safelist`, and `separator` from the old JavaScript config are not supported in v4.

### 🚀 Summary of Changes

The core philosophy in v4 is to keep configuration in CSS, which simplifies setup and allows for more dynamic theming. The table below summarizes the shift:

| v3 (JavaScript Config) | v4 (CSS-First)                  |
| :--------------------- | :------------------------------ |
| `theme.extend.colors`  | `@theme { --color-* }`          |
| `content` array        | Automatic detection + `@source` |
| `plugins` array        | `@plugin` directive             |
| `darkMode` option      | `@custom-variant` directive     |

Would you like a deeper explanation of any of these directives, such as how to migrate a specific part of your v3 config?
