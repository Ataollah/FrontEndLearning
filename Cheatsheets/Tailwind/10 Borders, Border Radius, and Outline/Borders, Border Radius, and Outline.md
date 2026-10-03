# Borders, Border Radius, and Outline in Tailwind CSS

## 1. Borders

Borders are lines drawn **inside the edge** of an element (technically on the border-box).

### Border Width
```html
<div class="border">...</div>        <!-- 1px on all sides -->
<div class="border-2">...</div>      <!-- 2px -->
<div class="border-4">...</div>      <!-- 4px -->
<div class="border-8">...</div>      <!-- 8px -->
<div class="border-0">...</div>      <!-- removes border -->
```

### Per-side widths
```html
<div class="border-t">...</div>      <!-- top only -->
<div class="border-r-4">...</div>    <!-- right, 4px -->
<div class="border-b-2">...</div>    <!-- bottom, 2px -->
<div class="border-l">...</div>      <!-- left only -->
<div class="border-x">...</div>      <!-- left + right -->
<div class="border-y">...</div>      <!-- top + bottom -->
```

### Border Color
```html
<div class="border border-red-500">...</div>
<div class="border-2 border-blue-300">...</div>
<div class="border border-gray-200">...</div>
<div class="border border-transparent">...</div>
```

### Border Style
```html
<div class="border border-dashed">...</div>
<div class="border-2 border-dotted">...</div>
<div class="border border-double">...</div>
<div class="border border-none">...</div>
```

> ⚠️ `border` sets width but **not color or style**. By default Tailwind sets border color to `currentColor` (the text color) unless you specify one. So always pair `border` with a color class.

---

## 2. Border Radius

Rounds the corners of an element.

```html
<div class="rounded-none">...</div>   <!-- 0 -->
<div class="rounded-sm">...</div>     <!-- 0.125rem -->
<div class="rounded">...</div>        <!-- 0.25rem -->
<div class="rounded-md">...</div>     <!-- 0.375rem -->
<div class="rounded-lg">...</div>     <!-- 0.5rem -->
<div class="rounded-xl">...</div>     <!-- 0.75rem -->
<div class="rounded-2xl">...</div>    <!-- 1rem -->
<div class="rounded-3xl">...</div>    <!-- 1.5rem -->
<div class="rounded-full">...</div>   <!-- pill / circle -->
```

### Per-corner radius
```html
<div class="rounded-t-lg">...</div>      <!-- top-left + top-right -->
<div class="rounded-b-lg">...</div>      <!-- bottom corners -->
<div class="rounded-l-lg">...</div>      <!-- left corners -->
<div class="rounded-tl-lg">...</div>     <!-- top-left only -->
<div class="rounded-tr-lg">...</div>     <!-- top-right only -->
<div class="rounded-br-lg">...</div>     <!-- bottom-right only -->
<div class="rounded-bl-lg">...</div>     <!-- bottom-left only -->
```

### Custom values
```html
<div class="rounded-[20px]">...</div>
<div class="rounded-tl-[2rem]">...</div>
```

**Tip:** `rounded-full` on a square element with equal width/height creates a perfect circle.

---

## 3. Outline

An outline is a line drawn **outside the border**, and unlike borders it **does not take up space** in the layout. It also follows the border-radius in modern browsers.

```html
<div class="outline">...</div>          <!-- 1px solid outline -->
<div class="outline-2">...</div>        <!-- 2px -->
<div class="outline-4">...</div>        <!-- 4px -->
<div class="outline-0">...</div>        <!-- removes outline -->
```

### Outline Color
```html
<div class="outline outline-2 outline-blue-500">...</div>
<div class="outline-2 outline-red-500">...</div>
```

### Outline Style
```html
<div class="outline-dashed">...</div>
<div class="outline-dotted">...</div>
<div class="outline-double">...</div>
<div class="outline-none">...</div>     <!-- no outline -->
```

### Outline Offset
Pushes the outline away from the element's edge:
```html
<div class="outline outline-2 outline-offset-2">...</div>
<div class="outline outline-2 outline-offset-4">...</div>
<div class="outline outline-2 -outline-offset-2">...</div>  <!-- inward -->
```

Common pattern — focus rings:
```html
<button class="focus:outline-none focus:ring-2 focus:ring-blue-500">
  Click me
</button>
```

---

## Border vs Outline — Key Differences

| Feature | Border | Outline |
|---------|--------|---------|
| Takes up space | ✅ Yes | ❌ No |
| Can be per-side | ✅ Yes | ❌ No (all sides) |
| Follows border-radius | ✅ Yes | ✅ Yes (modern browsers) |
| Can be offset | ❌ No | ✅ Yes |
| Affects layout | ✅ Yes | ❌ No |

---

## Putting It Together

```html
<div class="
  w-64 p-4
  border-2 border-blue-400 rounded-xl
  outline outline-2 outline-offset-4 outline-blue-200
">
  Styled box
</div>
```

This gives you:
- A 2px blue **border** hugging the element
- Rounded corners via **border-radius**
- A separated 2px light-blue **outline** floating outside the border