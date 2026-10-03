# Using Tailwind CSS Plugins: Typography, Forms, and Container

Tailwind CSS plugins extend the framework with pre-built component styles and utilities. Let me explain each of the three you mentioned.

---

## 1. **@tailwindcss/typography**

Provides beautiful default styling for HTML content you don't control (like markdown-rendered content, CMS output, or user-generated articles).

### Installation
```bash
npm install -D @tailwindcss/typography
```

### Setup (Tailwind v3 - `tailwind.config.js`)
```js
module.exports = {
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

### Setup (Tailwind v4 - CSS-based)
```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

### Usage
Wrap content in `prose` and it auto-styles headings, paragraphs, lists, links, etc.

```html
<article class="prose lg:prose-xl">
  <h1>Article Title</h1>
  <p>This paragraph gets sensible spacing and color automatically.</p>
  <ul>
    <li>List items styled too</li>
    <li>No manual classes needed</li>
  </ul>
</article>
```

**Modifiers:**
- Size: `prose-sm`, `prose-base`, `prose-lg`, `prose-xl`, `prose-2xl`
- Color: `prose-slate`, `prose-gray`, `prose-zinc`, `prose-red`, etc.
- Dark mode: `dark:prose-invert`
- Remove styling: `not-prose` on a child element

```html
<div class="prose dark:prose-invert">
  <h2>Dark mode works automatically</h2>
  <div class="not-prose">
    <!-- Custom component that shouldn't inherit prose styles -->
  </div>
</div>
```

---

## 2. **@tailwindcss/forms**

Resets and restyles form elements so they're consistent across browsers and easy to customize with utilities.

### Installation
```bash
npm install -D @tailwindcss/forms
```

### Setup (v3)
```js
module.exports = {
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
```

### Setup (v4)
```css
@plugin "@tailwindcss/forms";
```

### Usage
Just add `class="form-input"`, `form-checkbox`, `form-radio`, `form-select`, `form-textarea`, or `form-multiselect`:

```html
<form class="space-y-4">
  <input type="text" class="form-input rounded-md" placeholder="Name" />

  <select class="form-select rounded-md">
    <option>Option 1</option>
  </select>

  <input type="checkbox" class="form-checkbox text-indigo-600" />
  <input type="radio" class="form-radio text-indigo-600" />

  <textarea class="form-textarea rounded-md"></textarea>
</form>
```

You can now apply Tailwind utilities like `border-red-500`, `focus:ring-2`, `rounded-lg`, etc.

### Strategy Options
The plugin supports different reset strategies:

```js
require('@tailwindcss/forms')({
  strategy: 'base',     // (default) global reset — styles all form elements
  // strategy: 'class', // only applied when you use form-* classes
})
```

---

## 3. **Container Queries (@tailwindcss/container-queries)**

> **Note:** The "Container" plugin you likely mean is `@tailwindcss/container-queries`, which lets you style based on the **parent container's size**, not the viewport. (Tailwind also has a built-in `container` utility class for centering content, but that's a different thing.)

### Installation
```bash
npm install -D @tailwindcss/container-queries
```

### Setup (v3)
```js
module.exports = {
  plugins: [
    require('@tailwindcss/container-queries'),
  ],
}
```

### Setup (v4)
```css
@plugin "@tailwindcss/container-queries";
```

### Usage
Mark a parent as a container with `@container`, then use `@sm:`, `@md:`, `@lg:` variants on children — these respond to the **container's** width:

```html
<div class="@container">
  <div class="flex flex-col @md:flex-row @lg:gap-8">
    <img class="w-full @md:w-1/3" src="..." />
    <p class="@md:text-lg">Content adapts to the container, not the screen.</p>
  </div>
</div>
```

**Named containers** (when you have nested containers):
```html
<div class="@container/sidebar">
  <div class="@md/sidebar:block hidden">…</div>
</div>
```

**Built-in container utility (for reference):**
```html
<div class="container mx-auto px-4">
  <!-- Centers and constrains width at each breakpoint -->
</div>
```

---

## Combining All Three

```html
<div class="container mx-auto p-6">
  <form class="space-y-4 @container">
    <input type="email" class="form-input w-full @md:w-1/2" />
    <input type="password" class="form-input w-full @md:w-1/2" />
    <button class="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
  </form>

  <article class="prose dark:prose-invert mt-10">
    <h1>Welcome</h1>
    <p>Markdown or CMS content styled automatically.</p>
  </article>
</div>
```

---

## Quick Comparison

| Plugin | Purpose | Key Classes |
|---|---|---|
| **Typography** | Style rich text content | `prose`, `prose-lg`, `not-prose` |
| **Forms** | Consistent form element styling | `form-input`, `form-select`, `form-checkbox` |
| **Container Queries** | Component-level responsiveness | `@container`, `@md:`, `@lg:` |

> **Tailwind v4 tip:** All three can be enabled with a single CSS line each: `@plugin "@tailwindcss/typography";` etc. — no JS config required.