# Spacing in Tailwind CSS: Padding, Margin, Width, Height

Tailwind uses a **consistent spacing scale** across all spacing utilities, which makes the system predictable and easy to remember.

## The Spacing Scale

Tailwind's default scale is based on `0.25rem` (4px) increments:

| Class suffix | rem | px |
|--------------|-----|-----|
| `0` | 0 | 0px |
| `0.5` | 0.125rem | 2px |
| `1` | 0.25rem | 4px |
| `2` | 0.5rem | 8px |
| `3` | 0.75rem | 12px |
| `4` | 1rem | 16px |
| `6` | 1.5rem | 24px |
| `8` | 2rem | 32px |
| `12` | 3rem | 48px |
| `16` | 4rem | 64px |
| ... | ... | ... |
| `96` | 24rem | 384px |

You multiply the number by 4px to get pixels. This scale applies to padding, margin, width, height, gap, and more.

---

## Padding (`p`)

Adds space **inside** an element, between its content and its border.

```html
<!-- All sides -->
<div class="p-4">Padding all sides</div>

<!-- Directional -->
<div class="px-4 py-2">Horizontal 4, Vertical 2</div>
<div class="pt-2 pr-4 pb-6 pl-8">Each side individually</div>
```

| Prefix | Meaning |
|--------|---------|
| `p-` | all sides |
| `px-` | left + right |
| `py-` | top + bottom |
| `pt-` `pr-` `pb-` `pl-` | individual sides |

---

## Margin (`m`)

Adds space **outside** an element, pushing it away from neighbors.

```html
<div class="m-4">Margin all sides</div>
<div class="mx-auto">Horizontally centered</div>
<div class="mt-2 mb-4">Top and bottom</div>
```

### Special margin values

- `m-auto`, `mx-auto`, `my-auto` — auto margins (great for centering).
- **Negative margins**: `-m-4`, `-mt-2`, `-mx-8` — pull elements closer or overlap.

```html
<div class="-mt-4">Pulled up by 1rem</div>
```

---

## Width (`w`)

Sets the horizontal size of an element.

```html
<div class="w-64">16rem wide</div>
<div class="w-1/2">50% of parent</div>
<div class="w-full">100% of parent</div>
<div class="w-screen">100vw</div>
<div class="w-auto">auto</div>
```

| Type | Examples |
|------|----------|
| Fixed scale | `w-4`, `w-16`, `w-64` |
| Fractions | `w-1/2`, `w-1/3`, `w-2/5` |
| Keywords | `w-full`, `w-screen`, `w-auto`, `w-min`, `w-max`, `w-fit` |

### Min/Max width
```html
<div class="min-w-0 max-w-md">...</div>
<div class="max-w-screen-lg mx-auto">Centered container</div>
```

---

## Height (`h`)

Sets the vertical size of an element.

```html
<div class="h-32">8rem tall</div>
<div class="h-full">100% of parent</div>
<div class="h-screen">100vh</div>
```

| Type | Examples |
|------|----------|
| Fixed scale | `h-4`, `h-16`, `h-64` |
| Fractions | `h-1/2`, `h-1/3` |
| Keywords | `h-full`, `h-screen`, `h-auto`, `h-min`, `h-max`, `h-fit` |

### Min/Max height
```html
<div class="min-h-screen">At least full viewport</div>
<div class="max-h-96 overflow-y-auto">Scrollable</div>
```

---

## Responsive & State Variants

Every spacing utility works with breakpoints and states:

```html
<div class="p-2 md:p-4 lg:p-8">
  Padding grows on larger screens
</div>

<div class="mt-4 hover:mt-2 focus:ring-2">
  Changes on hover/focus
</div>
```

Breakpoints: `sm:` `md:` `lg:` `xl:` `2xl:`
States: `hover:` `focus:` `active:` `disabled:` etc.

---

## Customizing the Scale

In `tailwind.config.js`, extend or override:

```js
module.exports = {
  theme: {
    extend: {
      spacing: {
        '13': '3.25rem',
        '128': '32rem',
      },
    },
  },
}
```

Now `p-13`, `m-128`, etc. become available.

---

## Key Mental Model

- **Padding = inside** (content pushes away from border)
- **Margin = outside** (element pushes away from siblings)
- **Width/Height = size** of the box itself
- **The number means `number × 0.25rem`** — consistent everywhere
- **`-` prefix = negative margin** (margin only)
- **`auto` = browser calculates** (margin/width/height)

## Common Patterns

```html
<!-- Centered container -->
<div class="max-w-4xl mx-auto px-4">...</div>

<!-- Card -->
<div class="p-6 rounded-lg shadow">...</div>

<!-- Full-height hero -->
<section class="min-h-screen flex items-center justify-center">...</section>

<!-- Button -->
<button class="px-4 py-2 my-2 rounded bg-blue-500 text-white">Click</button>
```

Once you internalize the 4px multiplier, you can read any Tailwind class and instantly know its size.