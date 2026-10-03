# Tailwind CSS Positioning Explained

Tailwind provides utility classes that map directly to CSS `position` values. Let me break down each one.

## The Position Classes

| Tailwind Class | CSS Value |
|----------------|-----------|
| `static` | `position: static` |
| `relative` | `position: relative` |
| `absolute` | `position: absolute` |
| `fixed` | `position: fixed` |
| `sticky` | `position: sticky` |

You combine these with **inset utilities** to place elements:
`top-0`, `right-0`, `bottom-0`, `left-0`, `inset-0`, `inset-x-4`, `top-1/2`, etc.

---

## 1. `static` (default)

Normal document flow. `top/left/right/bottom` **have no effect**. Every element is static unless you change it.

```html
<div class="static">I flow normally</div>
```

---

## 2. `relative`

Stays in normal flow, **but** you can nudge it with `top/left` etc. — the original space is *preserved*. Also serves as the **positioning context** for `absolute` children.

```html
<div class="relative top-2 left-4 bg-blue-200">
  Shifted 8px down, 16px right — original space still reserved
</div>
```

**Most common use:** making a container a reference point:

```html
<div class="relative w-64 h-64 bg-gray-100">
  <span class="absolute top-2 right-2 bg-red-500 text-white px-2">
    Badge
  </span>
</div>
```

---

## 3. `absolute`

Removed from normal flow. Positioned **relative to the nearest positioned ancestor** (any ancestor with `relative`, `absolute`, `fixed`, or `sticky`). If none exists, it positions relative to the `<html>` (viewport/page).

```html
<div class="relative h-40 bg-gray-200">
  <div class="absolute bottom-0 right-0 bg-black text-white p-2">
    Anchored to parent's bottom-right
  </div>
</div>
```

**Key traits:**
- Doesn't take up space in the layout
- Other elements ignore it (may overlap)
- Great for dropdowns, badges, tooltips, overlays

---

## 4. `fixed`

Removed from flow, positioned **relative to the viewport**. Stays in place when you scroll. Ignores ancestor positioning (unless an ancestor has `transform`, `filter`, or `perspective` — that creates a new containing block).

```html
<nav class="fixed top-0 left-0 w-full bg-white shadow z-50">
  Sticky navbar that never scrolls away
</nav>

<button class="fixed bottom-6 right-6 rounded-full bg-blue-600 text-white p-4">
  Chat
</button>
```

**Use for:** navbars, floating action buttons, modals, cookie banners.

---

## 5. `sticky`

A **hybrid** of relative and fixed. Behaves like `relative` until it hits a threshold (`top-0`, `bottom-4`, etc.) while scrolling, then "sticks" like `fixed` **within its parent container**.

```html
<div class="h-96 overflow-y-auto">
  <header class="sticky top-0 bg-white shadow">Sticky Header</header>
  <p>Long content...</p>
</div>
```

**Important rules:**
- You **must** specify at least one inset value (`top-0`, `bottom-0`, etc.) or it won't stick.
- It only sticks **within its parent** — once the parent scrolls past, the sticky element goes with it.
- A parent with `overflow: hidden` will break sticky behavior.

**Use for:** section headers, table headers, sidebar TOC.

---

## Quick Comparison

| Behavior | static | relative | absolute | fixed | sticky |
|---|---|---|---|---|---|
| In normal flow | ✅ | ✅ | ❌ | ❌ | ✅ (until stuck) |
| Offset works | ❌ | ✅ | ✅ | ✅ | ✅ |
| Positions relative to | — | itself | nearest positioned ancestor | viewport | scroll container + parent bounds |
| Scrolls with page | ✅ | ✅ | ✅ | ❌ | until threshold |
| Creates context for children | ❌ | ✅ | ✅ | ✅ | ✅ |

---

## Common Gotcha: The Positioning Context

`absolute` finds the **closest ancestor** with a position other than `static`. If you forget `relative` on the parent, the child will fly up to the page root:

```html
<!-- ❌ Bad: badge escapes to page top-right -->
<div class="w-64 h-64 bg-gray-100">
  <span class="absolute top-2 right-2">Badge</span>
</div>

<!-- ✅ Good -->
<div class="relative w-64 h-64 bg-gray-100">
  <span class="absolute top-2 right-2">Badge</span>
</div>
```

---

## Handy z-index Pairing

Positioned elements stack, so control order with `z-0`, `z-10`, `z-20`, `z-50`, etc.:

```html
<nav class="fixed top-0 z-50">...</nav>
<div class="absolute z-10">...</div>
```

Want me to show a full real-world example (like a modal, dropdown, or sticky sidebar)?