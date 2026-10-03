# Comprehensive Guide to Hover, Focus, Active, and Disabled States in Tailwind CSS

Tailwind CSS provides **state variants** (also called modifiers) that let you apply utility classes conditionally based on the state of an element. These are essential for building interactive, accessible UIs.

---

## 1. The Core Concept

In Tailwind, you prefix a utility with a state variant followed by a colon:

```html
<button class="bg-blue-500 hover:bg-blue-700">
  Click me
</button>
```

Here, `hover:` means "apply `bg-blue-700` only when the element is hovered."

Under the hood, Tailwind generates CSS like:

```css
.hover\:bg-blue-700:hover {
  background-color: #1d4ed8;
}
```

---

## 2. Hover State (`hover:`)

### What it is
Triggered when the user's pointer is over an element. Most common for desktop interactivity.

### Syntax
```html
<div class="bg-white hover:bg-gray-100 hover:shadow-lg">
  Hover me
</div>
```

### Common use cases
- Buttons changing background/text color
- Links showing underline
- Cards lifting with shadow
- Revealing hidden elements (`hover:block`, `hover:opacity-100`)

```html
<button class="bg-blue-500 text-white px-4 py-2 rounded
               hover:bg-blue-600
               hover:scale-105
               transition">
  Hover me
</button>
```

### Important notes
- **Touch devices** don't have hover in the traditional sense. Mobile browsers may "simulate" hover on tap, causing sticky states.
- Use Tailwind's `hover:` only on devices that support it if you want to avoid mobile issues:
  ```html
  <div class="hover:bg-gray-100 md:hover:bg-gray-100">
  ```
  Or better, use the `@media (hover: hover)` strategy via a plugin or custom variant in v3.4+:
  ```html
  <div class="hover:bg-gray-100">
  ```
  Tailwind v3.4+ actually wraps `hover:` in `@media (hover: hover)` by default if you configure `hoverOnlyWhenSupported: true` in `future` options.

### Stacking with other variants
```html
<button class="md:hover:bg-blue-700 dark:hover:bg-blue-900">
  Responsive + dark mode hover
</button>
```

---

## 3. Focus State (`focus:`)

### What it is
Triggered when an element receives focus — usually via keyboard Tab, or by clicking an input/button.

### Syntax
```html
<input class="border focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" />
```

### Common use cases
- Highlighting form inputs
- Showing focus rings for accessibility
- Revealing dropdown content

### Related focus variants
Tailwind provides several focus-related variants:

| Variant | When it applies |
|---------|-----------------|
| `focus:` | Element is focused |
| `focus-visible:` | Focused via keyboard (not mouse click) — **best for accessibility** |
| `focus-within:` | Element **or a descendant** is focused (great for form groups) |

```html
<!-- Parent highlights when child input is focused -->
<div class="border p-2 focus-within:border-blue-500 focus-within:bg-blue-50">
  <input class="outline-none" placeholder="Email" />
</div>
```

### Accessibility best practice
Never remove focus styles without replacing them:
```html
<!-- ❌ Bad -->
<button class="focus:outline-none">Save</button>

<!-- ✅ Good -->
<button class="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
  Save
</button>
```

`focus-visible:` only shows the ring when navigating by keyboard, avoiding ugly outlines for mouse users while keeping keyboard users happy.

---

## 4. Active State (`active:`)

### What it is
Triggered **while** the element is being pressed (mouse button down) or activated (keyboard Enter/Space held).

### Syntax
```html
<button class="bg-blue-500 active:bg-blue-800 active:scale-95 transition">
  Press me
</button>
```

### Common use cases
- Visual "click" feedback
- Button press animations
- Link click states

### Difference from `:focus` and `:hover`
- `:hover` → pointer is over the element
- `:active` → element is being pressed **right now**
- `:focus` → element has focus (persists after release)

Order matters in CSS specificity. Tailwind outputs variants in a specific order, but when stacking manually you may want:
```html
<button class="hover:bg-blue-600 active:bg-blue-800 focus:ring-2">
```
Tailwind's default variant order ensures `active` overrides `hover` where appropriate.

---

## 5. Disabled State (`disabled:`)

### What it is
Applies when an element has the `disabled` attribute (form controls like `<button>`, `<input>`, `<select>`, `<textarea>`, `<fieldset>`).

### Syntax
```html
<button
  disabled
  class="bg-blue-500 text-white
         disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed">
  Can't click
</button>
```

### Common use cases
- Greyed-out buttons during loading
- Non-interactive inputs
- Preventing double submission

### Related variants

| Variant | Purpose |
|---------|---------|
| `disabled:` | Native `disabled` attribute |
| `enabled:` | Opposite — element is not disabled |
| `aria-disabled:` | Custom variant (v3.4+) for `aria-disabled="true"` |
| `read-only:` | For `readonly` inputs |
| `required:` / `invalid:` / `valid:` | Form validation states |

### Example: form validation styling
```html
<input
  type="email"
  required
  class="border
         invalid:border-red-500 invalid:text-red-600
         valid:border-green-500
         disabled:bg-gray-100 disabled:cursor-not-allowed" />
```

---

## 6. Combining Variants (Stacking)

You can stack multiple variants. Order generally goes **from least specific to most specific** reading left to right, but Tailwind resolves order internally:

```html
<button class="
  bg-blue-500
  hover:bg-blue-600
  focus-visible:ring-2 focus-visible:ring-blue-300
  active:bg-blue-700
  disabled:bg-gray-300 disabled:cursor-not-allowed
  dark:bg-blue-400 dark:hover:bg-blue-500
  md:hover:scale-105
  transition
">
  Full state coverage
</button>
```

Notes:
- `dark:hover:` = hover **while** in dark mode
- `md:focus:` = focus **at** md breakpoint and above
- `group-hover:` = hover on a **parent** with class `group`

### Group and Peer variants (bonus)
```html
<!-- Change child when parent is hovered -->
<div class="group">
  <p class="group-hover:text-blue-500">Text</p>
</div>

<!-- Change sibling based on peer state -->
<input type="checkbox" class="peer" />
<label class="peer-checked:text-blue-500">Label</label>
```

Same idea works with `group-focus:`, `group-active:`, `peer-disabled:`, etc.

---

## 7. Custom Variants (Tailwind v3.4+)

You can define your own state variants in `tailwind.config.js`:

```js
// tailwind.config.js
module.exports = {
  theme: { /* ... */ },
  plugins: [
    function ({ addVariant }) {
      addVariant('hocus', ['&:hover', '&:focus']); // combine
      addVariant('optional', '&:optional');
    },
  ],
};
```

Usage:
```html
<button class="hocus:bg-blue-600">Hover or focus</button>
```

---

## 8. Quick Reference Table

| Variant | Trigger | Typical Use |
|---------|---------|-------------|
| `hover:` | Pointer over element | Buttons, links, cards |
| `focus:` | Element receives focus | Inputs, buttons |
| `focus-visible:` | Focus via keyboard | Accessible focus rings |
| `focus-within:` | Self or descendant focused | Form groups, dropdowns |
| `active:` | Element pressed | Click feedback |
| `disabled:` | `disabled` attribute present | Greyed-out controls |
| `enabled:` | Not disabled | Default state styling |
| `visited:` | Link visited | Link styling |
| `target:` | Element is URL `:target` | Anchor navigation |
| `group-*` | Parent state | Cascading effects |
| `peer-*` | Sibling state | Custom checkboxes, etc. |

---

## 9. Best Practices Summary

1. **Always provide focus styles** — never remove them; use `focus-visible:` for polish.
2. **Use `transition`** with hover/active for smoothness:
   ```html
   <button class="transition-colors duration-200 hover:bg-blue-600">
   ```
3. **Consider touch devices** — hover-only UX breaks on mobile. Use `hoverOnlyWhenSupported` or gate with `md:`.
4. **Use `disabled:cursor-not-allowed`** for UX clarity.
5. **Stack state variants thoughtfully** — `hover:focus:` is valid but rarely useful; `dark:hover:` and `md:focus:` are common.
6. **Prefer `focus-visible:` over `focus:`** for buttons/links to avoid mouse-click outlines.
7. **Group related variants** for readability:
   ```html
   class="hover:bg-blue-600 focus:bg-blue-600 active:bg-blue-700"
   ```

---

## 10. Full Interactive Example

```html
<button
  class="
    px-4 py-2 rounded-md font-medium
    bg-blue-500 text-white
    transition-all duration-200
    hover:bg-blue-600 hover:shadow-md
    focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2
    active:bg-blue-700 active:scale-95
    disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none
    dark:bg-blue-600 dark:hover:bg-blue-500
  "
>
  Submit
</button>
```

This single button demonstrates all four core states — hover, focus (visible), active, and disabled — with sensible transitions and dark mode support.