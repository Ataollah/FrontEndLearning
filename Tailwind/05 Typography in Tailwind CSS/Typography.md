## Typography in Tailwind CSS

Tailwind provides utility classes for controlling font size, weight, and line height. Here's a comprehensive breakdown:

## 1. **Font Size**

Tailwind uses a **modular scale** for font sizes with predefined classes:

```html
<!-- Font Size Classes -->
<p class="text-xs">Extra Small (0.75rem / 12px)</p>
<p class="text-sm">Small (0.875rem / 14px)</p>
<p class="text-base">Base (1rem / 16px) - Default</p>
<p class="text-lg">Large (1.125rem / 18px)</p>
<p class="text-xl">Extra Large (1.25rem / 20px)</p>
<p class="text-2xl">2XL (1.5rem / 24px)</p>
<p class="text-3xl">3XL (1.875rem / 30px)</p>
<p class="text-4xl">4XL (2.25rem / 36px)</p>
<p class="text-5xl">5XL (3rem / 48px)</p>
<p class="text-6xl">6XL (3.75rem / 60px)</p>
<p class="text-7xl">7XL (4.5rem / 72px)</p>
<p class="text-8xl">8XL (6rem / 96px)</p>
<p class="text-9xl">9XL (8rem / 128px)</p>
```

### Custom Font Sizes
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontSize: {
        'xxs': '0.625rem',
        'huge': '5rem',
      }
    }
  }
}
```

## 2. **Font Weight**

Control text thickness with font weight utilities:

```html
<!-- Font Weight Classes -->
<p class="font-thin">Thin (100)</p>
<p class="font-extralight">Extra Light (200)</p>
<p class="font-light">Light (300)</p>
<p class="font-normal">Normal (400) - Default</p>
<p class="font-medium">Medium (500)</p>
<p class="font-semibold">Semibold (600)</p>
<p class="font-bold">Bold (700)</p>
<p class="font-extrabold">Extra Bold (800)</p>
<p class="font-black">Black (900)</p>
```

### Custom Font Weights
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontWeight: {
        'extraheavy': '950',
      }
    }
  }
}
```

## 3. **Line Height**

Also called **leading**, controls vertical spacing between lines:

```html
<!-- Line Height Classes -->
<p class="leading-none">None (1)</p>
<p class="leading-tight">Tight (1.25)</p>
<p class="leading-snug">Snug (1.375)</p>
<p class="leading-normal">Normal (1.5) - Default</p>
<p class="leading-relaxed">Relaxed (1.625)</p>
<p class="leading-loose">Loose (2)</p>

<!-- Numeric Line Heights -->
<p class="leading-3">0.75rem</p>
<p class="leading-4">1rem</p>
<p class="leading-5">1.25rem</p>
<p class="leading-6">1.5rem</p>
<!-- ... up to leading-10 -->
```

### Custom Line Heights
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      lineHeight: {
        'extra-loose': '2.5',
        '12': '3rem',
      }
    }
  }
}
```

## Combining All Three

Tailwind's font size classes **include default line heights**:

```html
<!-- text-xl includes line-height: 1.75rem by default -->
<p class="text-xl">This has preset line height</p>

<!-- Override the line height -->
<p class="text-xl leading-relaxed">Custom line height</p>

<!-- Complete example -->
<h1 class="text-4xl font-bold leading-tight text-gray-900">
  Bold Heading with Tight Spacing
</h1>
<p class="text-base font-normal leading-relaxed text-gray-600">
  Body text with relaxed line height for better readability.
</p>
```

## Responsive Typography

Apply different styles at different breakpoints:

```html
<h1 class="text-2xl md:text-4xl lg:text-6xl font-bold leading-tight">
  Responsive Heading
</h1>
```

## Best Practices

### 1. **Readable Body Text**
```html
<p class="text-base font-normal leading-relaxed">
  Long-form content should use base size, normal weight, 
  and relaxed line height for optimal readability.
</p>
```

### 2. **Heading Hierarchy**
```html
<h1 class="text-4xl font-bold leading-tight">Main Title</h1>
<h2 class="text-3xl font-semibold leading-snug">Section</h2>
<h3 class="text-2xl font-medium leading-normal">Subsection</h3>
```

### 3. **Line Height Guidelines**
- **Headings**: Use tighter line heights (`leading-tight`, `leading-snug`)
- **Body text**: Use `leading-normal` or `leading-relaxed`
- **Small text**: Consider `leading-relaxed` for readability

### 4. **Font Weight for Hierarchy**
```html
<!-- Good hierarchy -->
<div>
  <h2 class="text-2xl font-bold">Title</h2>
  <p class="text-sm font-normal">Description</p>
  <button class="text-sm font-medium">Action</button>
</div>
```

### 5. **Accessibility Considerations**
```html
<!-- Ensure sufficient contrast and readable sizes -->
<p class="text-base md:text-lg font-normal leading-relaxed text-gray-700">
  Minimum 16px for body text, larger on bigger screens
</p>
```

## Common Patterns

### Card Component
```html
<div class="p-6">
  <h3 class="text-xl font-semibold leading-tight mb-2">
    Card Title
  </h3>
  <p class="text-sm font-normal leading-relaxed text-gray-600">
    Card description with comfortable reading line height.
  </p>
</div>
```

### Button Text
```html
<button class="text-sm font-medium leading-none px-4 py-2">
  Click Me
</button>
```

### Article Layout
```html
<article class="prose">
  <h1 class="text-3xl md:text-4xl font-bold leading-tight mb-4">
    Article Title
  </h1>
  <p class="text-lg font-normal leading-relaxed mb-6">
    Lead paragraph with slightly larger text.
  </p>
  <p class="text-base font-normal leading-relaxed">
    Body content with standard sizing and comfortable line height.
  </p>
</article>
```

These three properties work together to create **visual hierarchy**, **readability**, and **aesthetic balance** in your typography system.