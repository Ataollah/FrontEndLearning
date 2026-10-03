In Tailwind CSS, **Transitions** and **Transformations** are two related but distinct sets of utilities that let you animate elements in response to state changes (like hover, focus, or toggling a class).

## Transitions

Transitions control **how** a property changes over time — the animation between two states. They don't do anything on their own; they need a change to animate (e.g., a hover state).

Tailwind provides utilities for the four CSS transition properties:

### 1. `transition-property`
Which CSS properties should animate:

```html
<div class="transition">...</div>          <!-- common properties -->
<div class="transition-colors">...</div>   <!-- color, bg, border, etc. -->
<div class="transition-transform">...</div><!-- transform only -->
<div class="transition-opacity">...</div>
<div class="transition-all">...</div>      <!-- everything -->
<div class="transition-none">...</div>
```

### 2. `transition-duration`
How long the transition takes:

```html
<div class="duration-150">...</div>
<div class="duration-300">...</div>
<div class="duration-700">...</div>
```

### 3. `transition-timing-function`
The easing curve:

```html
<div class="ease-linear">...</div>
<div class="ease-in">...</div>
<div class="ease-out">...</div>
<div class="ease-in-out">...</div>
```

### 4. `transition-delay`
Wait before starting:

```html
<div class="delay-150">...</div>
<div class="delay-300">...</div>
```

### Example
```html
<button class="bg-blue-500 transition-colors duration-300 ease-in-out hover:bg-blue-700">
  Hover me
</button>
```
The background smoothly fades to a darker blue over 300ms instead of snapping instantly.

---

## Transformations

Transform utilities **change an element's shape, size, or position** using CSS `transform`. By themselves they apply instantly — you typically combine them with `transition-transform` to animate smoothly.

Tailwind groups them into categories:

### 1. Scale
```html
<div class="scale-50">...</div>
<div class="scale-100">...</div>  <!-- default -->
<div class="scale-150">...</div>
<div class="scale-x-75 scale-y-125">...</div>
```

### 2. Rotate
```html
<div class="rotate-45">...</div>
<div class="rotate-90">...</div>
<div class="-rotate-45">...</div>
```

### 3. Translate (move)
```html
<div class="translate-x-4">...</div>
<div class="-translate-y-2">...</div>
```

### 4. Skew
```html
<div class="skew-x-12">...</div>
<div class="skew-y-6">...</div>
```

### 5. Transform origin
Where the transform is anchored:
```html
<div class="origin-center">...</div>
<div class="origin-top-left">...</div>
<div class="origin-bottom-right">...</div>
```

### 6. 3D transforms (v3.0+)
```html
<div class="rotate-x-45">...</div>
<div class="perspective-500">...</div>
<div class="transform-3d">...</div>
```

---

## Combining Both

The real power comes from pairing them:

```html
<div class="
  transition-transform duration-300 ease-out
  hover:scale-110 hover:rotate-3
">
  Card
</div>
```

Here:
- `transition-transform` tells the browser to animate transform changes
- `duration-300` + `ease-out` control the motion
- `hover:scale-110 hover:rotate-3` define the end state
- The element grows and tilts smoothly on hover

---

## Key Differences

| | Transitions | Transformations |
|---|---|---|
| **Purpose** | Animate property changes over time | Change element geometry (scale, rotate, move, skew) |
| **Trigger** | Needs a state change (hover, focus, class toggle) | Applied immediately when class is present |
| **CSS** | `transition-*` | `transform` |
| **Depends on** | Nothing | Often combined with `transition-transform` for animation |

Think of **transforms as the "what"** (the new shape/position) and **transitions as the "how"** (the smooth interpolation to get there).