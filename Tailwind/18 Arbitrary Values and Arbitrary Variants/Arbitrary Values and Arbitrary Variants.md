# Arbitrary Values and Arbitrary Variants in Tailwind CSS

## Conclusion

Arbitrary Values and Arbitrary Variants are two "escape hatches" provided by Tailwind CSS that allow you to break free from the built-in design system and write arbitrary CSS values or selectors directly in HTML using square bracket `[]` syntax. **Arbitrary Values** solve the problem of "the value you need isn't in the Tailwind scale," while **Arbitrary Variants** solve the problem of "the selector you need isn't among Tailwind's built-in variants". The two can be combined, but they should be used in moderation as temporary solutions rather than as a replacement for the design system.

---

## I. Arbitrary Values

### 1. Definition and Core Concept

The design system in Tailwind CSS predefines a limited set of spacing, color, size, and other values. When you need a value that doesn't exist in this scale (such as `117px` instead of the default `112px` or `128px`), Arbitrary Values allow you to write the exact CSS value directly in the class name using square brackets `[]`.

The core idea is: **Tailwind generates the style on demand rather than requiring it to be preconfigured**.

### 2. Basic Syntax

The syntax format is: `utility-[value]`

```html
<!-- Use 117px instead of the default spacing value -->
<div class="top-[117px]">Precise positioning</div>

<!-- Use a custom color -->
<div class="bg-[#bada55]">Custom background color</div>

<!-- Use a custom font size -->
<div class="text-[22px]">Custom font size</div>
```

When Tailwind parses these classes, it converts the content inside the square brackets into the corresponding CSS values.

### 3. Handling Whitespace

When an arbitrary value contains spaces (such as `calc()` expressions, multi-value grid templates, etc.), **you need to use underscores `_` instead of spaces**, and Tailwind will automatically convert them back to spaces at build time.

```html
<!-- Space in calc needs to be replaced with underscore -->
<div class="w-[calc(100%_-_2rem)]">Width calculation</div>

<!-- Spaces in a multi-column grid template also need underscores -->
<div class="grid-cols-[1fr_500px_2fr]">Three-column grid</div>
```

**Note**: In contexts where underscores themselves are valid (such as URLs), Tailwind does not perform conversion. If you need an actual underscore, you can escape it with a backslash `\_`.

### 4. Using CSS Variables

Tailwind supports referencing CSS variables in arbitrary values. In v4, there's a more concise syntax:

```html
<!-- v4 shorthand: use parentheses instead of var() -->
<div class="bg-(--brand-color)">Reference CSS variable</div>

<!-- Equivalent to the explicit writing style -->
<div class="bg-[var(--brand-color)]">Same effect</div>
```

### 5. Resolving Type Ambiguity

Some utility class prefixes map to multiple CSS properties. For example, `text-` can represent either `font-size` or `color`. Tailwind usually automatically infers the type based on the value, but when using CSS variables it cannot infer the type, so you need to provide a **type hint**.

```html
<!-- Auto-inferred as font-size -->
<div class="text-[22px]">...</div>

<!-- Auto-inferred as color -->
<div class="text-[#bada55]">...</div>

<!-- Ambiguity with CSS variables: need to add type hint -->
<div class="text-(length:--my-var)">...</div>  <!-- Font size -->
<div class="text-(color:--my-var)">...</div>    <!-- Color -->
```

### 6. Arbitrary Properties

When Tailwind doesn't provide a corresponding utility class for a certain CSS property at all, you can use the **Arbitrary Properties** syntax: `[property:value]`.

```html
<!-- CSS properties not built into Tailwind -->
<div class="[mask-type:luminance]">Apply SVG mask</div>

<!-- Can be used with variants -->
<div class="[mask-type:luminance] hover:[mask-type:alpha]">Toggle on hover</div>

<!-- Set CSS variable values directly in HTML -->
<div class="[--scroll-offset:56px] lg:[--scroll-offset:44px]">
  Set different values for different breakpoints
</div>
```

---

## II. Arbitrary Variants

### 1. Definition and Core Concept

Tailwind has many built-in variants (such as `hover:`, `focus:`, `md:`, etc.), but when you need a selector that Tailwind doesn't provide (such as `:nth-child(-n+3)` or a specific attribute selector), Arbitrary Variants allow you to write a custom selector directly in the class name.

The core idea is: **Create custom selectors on the fly using `[&...]:` syntax in square brackets, where `&` represents the current element**.

### 2. Basic Syntax

The syntax format is: `[selector]:utility`, where `&` refers to the element carrying that class.

```html
<!-- Target the first 3 child elements and underline on hover -->
<ul>
  <li class="[&:nth-child(-n+3)]:hover:underline">Item 1</li>
  <li class="[&:nth-child(-n+3)]:hover:underline">Item 2</li>
  <li class="[&:nth-child(-n+3)]:hover:underline">Item 3</li>
  <li>Item 4 (unaffected)</li>
</ul>
```

This class will be compiled into:
```css
.\[\&\:nth-child\(-n\+3\)\]\:hover\:underline:hover:nth-child(-n+3) {
  text-decoration-line: underline;
}
```

### 3. Common Usage Patterns

**Targeting child elements**: Use `[&>li]:` to select direct children, or `[&_p]:` (with underscore representing a space) to select all descendant elements.

```html
<!-- Direct child elements -->
<ul class="[&>li]:list-disc [&>li]:ml-4">...</ul>

<!-- Descendant elements (note the underscore) -->
<article class="[&_p]:text-slate-600 [&_h2]:text-2xl">
  <h2>Heading</h2>
  <p>Body text</p>
</article>
```

**Attribute and state selectors**:

```html
<!-- data attribute selector -->
<div data-state="open" class="data-[state=open]:rotate-180">...</div>

<!-- Custom class state -->
<div class="[&.is-dragging]:cursor-grabbing">...</div>
```

**@supports queries**:

```html
<div class="bg-white [@supports(backdrop-filter:blur(0))]:bg-white/50">
  Apply a semi-transparent background when backdrop-filter is supported
</div>
```

**Custom breakpoints**:

```html
<div class="[@media(min-width:711px)]:bg-green-500">
  Switch background color at 711px
</div>
```

### 4. Difference from `@custom-variant`

Arbitrary Variants are suitable for **one-off** custom selectors. If the same selector pattern appears **three or more times** in the project, you should extract it as a reusable `@custom-variant` (v4) or `addVariant` (v3).

---

## III. Practical Recommendations

### When to Use Arbitrary Values

Arbitrary Values are **escape hatches**, not a daily habit. Recommended usage scenarios:
- Genuine one-off values (such as a unique `clip-path` or a specific gradient)
- Experimental or vendor-specific CSS properties
- Targeting third-party HTML markup you cannot modify

### When to Extract as Design Tokens

The same arbitrary value appearing **three or more times** across the codebase is a signal that you're missing a design token. At this point, you should add it to `@theme` and replace all arbitrary values with named tokens.

### Avoid Abusing Arbitrary Values

Using arbitrary values to "bypass" missing tokens is the most common form of design system debt. Signs include:
- The value matches the design spec but not the Tailwind scale
- You've copied and pasted the same arbitrary value by muscle memory
- Searching for that value in the codebase yields 2 or more results

---

## Summary

| Feature | Syntax Example | Purpose |
|---------|---------------|---------|
| Arbitrary Values | `top-[117px]` | Break through scale limitations and use custom CSS values |
| Arbitrary Properties | `[mask-type:luminance]` | Use CSS properties Tailwind doesn't support |
| Arbitrary Variants | `[&:nth-child(3)]:py-0` | Create custom selectors on the fly |
| CSS Variable Reference | `bg-(--brand)` | Concise reference to CSS variables (v4) |
| Type Hint | `text-(length:--var)` | Resolve ambiguity in overloaded utility prefixes |

All three are powerful "escape hatches," but they should be used with restraint: temporary needs can use arbitrary syntax, and repeated patterns should be extracted as design tokens or custom variants.