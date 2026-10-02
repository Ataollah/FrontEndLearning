## Reusing Styles with `@apply` Directive in Tailwind CSS

The `@apply` directive is a powerful Tailwind CSS feature that allows you to extract utility classes into custom CSS classes, making your code more maintainable and reducing repetition.

## Basic Usage

### Without `@apply` (Repetitive)
```html
<button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
  Click me
</button>
<button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
  Submit
</button>
<button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
  Cancel
</button>
```

### With `@apply` (DRY Principle)
```css
/* styles.css */
.btn-primary {
  @apply px-4 py-2 bg-blue-500 text-white rounded;
  @apply hover:bg-blue-600 focus:outline-none;
  @apply focus:ring-2 focus:ring-blue-500;
}
```

```html
<button class="btn-primary">Click me</button>
<button class="btn-primary">Submit</button>
<button class="btn-primary">Cancel</button>
```

## Common Use Cases

### 1. **Component Classes**
```css
/* Card component */
.card {
  @apply bg-white rounded-lg shadow-md p-6;
}

.card-header {
  @apply text-xl font-semibold mb-4;
}

.card-body {
  @apply text-gray-700;
}
```

### 2. **Form Elements**
```css
.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.input-error {
  @apply border-red-500 focus:ring-red-500;
}
```

### 3. **Typography**
```css
.heading-1 {
  @apply text-4xl font-bold tracking-tight text-gray-900;
}

.heading-2 {
  @apply text-3xl font-semibold tracking-tight text-gray-900;
}

.body-text {
  @apply text-base leading-7 text-gray-600;
}
```

## Important Considerations

### 1. **When to Use `@apply`**
✅ **Good use cases:**
- Third-party library integration (e.g., styling a date picker)
- Complex components used across many files
- Email templates (where external CSS is needed)
- Small, reusable design tokens

❌ **Avoid when:**
- You can use component composition (React/Vue components)
- Simple one-off styles
- You're trying to avoid learning Tailwind utilities

### 2. **File Organization**
```css
/* app.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom components layer */
@layer components {
  .btn {
    @apply px-4 py-2 rounded font-semibold;
  }
  
  .btn-primary {
    @apply btn bg-blue-500 text-white hover:bg-blue-600;
  }
  
  .btn-secondary {
    @apply btn bg-gray-200 text-gray-800 hover:bg-gray-300;
  }
}
```

### 3. **Using `@layer` Directive**
The `@layer` directive helps maintain proper CSS specificity and ordering:

```css
@layer components {
  .custom-button {
    @apply px-4 py-2 bg-blue-500 text-white rounded;
  }
}

@layer utilities {
  .text-shadow {
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  }
}
```

## Advanced Techniques

### 1. **Conditional Classes with CSS Variables**
```css
.dynamic-button {
  @apply px-4 py-2 rounded;
  background-color: var(--button-bg, theme('colors.blue.500'));
  color: var(--button-text, white);
}
```

### 2. **Responsive Component Classes**
```css
.responsive-card {
  @apply p-4 md:p-6 lg:p-8;
  @apply text-sm md:text-base lg:text-lg;
}
```

### 3. **Dark Mode Support**
```css
.card {
  @apply bg-white dark:bg-gray-800;
  @apply text-gray-900 dark:text-gray-100;
}
```

## Pros and Cons

### Advantages ✅
- **DRY principle**: Reduces class repetition
- **Maintainability**: Change styles in one place
- **Readability**: Semantic class names
- **Framework integration**: Works with any framework

### Disadvantages ❌
- **Larger CSS bundle**: Extracted classes increase file size
- **Context switching**: Jumping between HTML and CSS files
- **Loses utility-first benefits**: Can lead to premature abstraction
- **Specificity issues**: Can be harder to override

## Best Practices

1. **Use sparingly**: Prefer component composition over `@apply` when possible
2. **Keep it simple**: Don't create overly complex abstractions
3. **Use `@layer components`**: Maintain proper CSS ordering
4. **Document complex classes**: Add comments explaining purpose
5. **Consider alternatives**: Sometimes a framework component is better

## Example: Complete Button System

```css
@layer components {
  /* Base button */
  .btn {
    @apply inline-flex items-center justify-center;
    @apply px-4 py-2 rounded-md font-medium;
    @apply transition-colors duration-200;
    @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
  }

  /* Size variants */
  .btn-sm {
    @apply px-3 py-1.5 text-sm;
  }

  .btn-lg {
    @apply px-6 py-3 text-lg;
  }

  /* Color variants */
  .btn-primary {
    @apply btn bg-blue-600 text-white;
    @apply hover:bg-blue-700 focus:ring-blue-500;
  }

  .btn-secondary {
    @apply btn bg-gray-200 text-gray-900;
    @apply hover:bg-gray-300 focus:ring-gray-500;
  }

  .btn-danger {
    @apply btn bg-red-600 text-white;
    @apply hover:bg-red-700 focus:ring-red-500;
  }

  /* Disabled state */
  .btn:disabled {
    @apply opacity-50 cursor-not-allowed;
  }
}
```

The `@apply` directive is a valuable tool in your Tailwind toolkit when used appropriately. It bridges the gap between utility-first CSS and component-based styling, but should be used judiciously to maintain the benefits of Tailwind's utility approach.