# Comprehensive Guide to CSS Animations

## 1. Transitions

Transitions allow CSS property values to change smoothly over a specified duration, rather than changing instantly. They're triggered by state changes (like `:hover`, `:focus`, or class changes via JavaScript).

### The Four Transition Sub-properties

**`transition-property`** — Specifies which CSS properties will transition.
```css
transition-property: background-color, transform, opacity;
/* Or use `all` (less performant) */
transition-property: all;
```

**`transition-duration`** — How long the transition takes.
```css
transition-duration: 0.3s;   /* or 300ms */
```

**`transition-timing-function`** — The acceleration curve (easing).
```css
transition-timing-function: ease-in-out;
```

**`transition-delay`** — Time to wait before starting.
```css
transition-delay: 100ms;
```

### Shorthand
```css
.button {
  /* property | duration | timing | delay */
  transition: background-color 0.3s ease 0.1s;
  /* Multiple transitions */
  transition: background-color 0.3s ease,
              transform 0.2s ease-out,
              opacity 0.5s linear 0.1s;
}
```

**Important:** Transitions require a **start and end state** and only animate properties with interpolable values (numbers, colors, lengths).

---

## 2. Easing Functions

Easing defines how intermediate values are calculated during an animation.

| Function | Description | Curve Behavior |
|----------|-------------|----------------|
| `linear` | Constant speed | Uniform throughout |
| `ease` | Default | Slow start, fast middle, slow end |
| `ease-in` | Starts slow | Accelerates toward end |
| `ease-out` | Ends slow | Decelerates at end |
| `ease-in-out` | Slow both ends | Slow start and end, fast middle |

**Cubic-bezier** — For custom control:
```css
transition-timing-function: cubic-bezier(0.42, 0, 0.58, 1); /* = ease-in-out */
```

**Steps** — For discrete jumps:
```css
transition-timing-function: steps(4, end); /* Sprite-sheet animations */
```

**Visual summary:**
```
linear:      ────────────  (steady)
ease-in:     ⌣──────────   (slow → fast)
ease-out:    ──────────⌢   (fast → slow)
ease-in-out: ⌣────────⌢   (slow → fast → slow)
ease:        gentle version of ease-in-out
```

---

## 3. Transform

`transform` changes an element's shape, size, or position **without affecting document flow** (neighbors stay in place).

### Core Transform Functions

**`translate(x, y)`** — Moves an element.
```css
transform: translate(50px, 100px);   /* 2D */
transform: translateX(50px);
transform: translateY(-20%);
transform: translate3d(10px, 20px, 30px); /* 3D, enables GPU */
```

**`scale(x, y)`** — Resizes.
```css
transform: scale(1.5);        /* Uniform */
transform: scale(2, 0.5);     /* Different X/Y */
transform: scaleX(2);
```
Note: scaling doesn't change layout size—only visual rendering.

**`rotate(angle)`** — Rotates.
```css
transform: rotate(45deg);
transform: rotateX(180deg);   /* 3D, requires perspective */
transform: rotateZ(90deg);
```

**`skew(x, y)`** — Slants.
```css
transform: skew(10deg, 5deg);
transform: skewX(15deg);
transform: skewY(-10deg);
```

### Combining Transforms
```css
transform: translateX(50px) rotate(45deg) scale(1.2);
```
⚠️ **Order matters!** Transforms apply right-to-left (the rightmost applies first to the element's coordinate system).

---

## 4. Transform-origin

Defines the **pivot point** for transformations. Default is `50% 50%` (center).

```css
transform-origin: center;              /* default */
transform-origin: top left;
transform-origin: 0 0;
transform-origin: 100% 50%;            /* right center */
transform-origin: 20px 40px;
transform-origin: 50% 50% 100px;       /* 3D */
```

**Example — rotating around a corner:**
```css
.pinwheel {
  transform-origin: 0% 100%; /* bottom-left corner */
  transform: rotate(45deg);
}
```

---

## 5. CSS Keyframe Animations (`@keyframes`)

Unlike transitions (which need a trigger), `@keyframes` animations run automatically and can have **multiple stages**.

### Defining Keyframes
```css
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(-100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Multi-stage with percentages */
@keyframes bounce {
  0%   { transform: translateY(0); }
  25%  { transform: translateY(-30px); }
  50%  { transform: translateY(0); }
  75%  { transform: translateY(-15px); }
  100% { transform: translateY(0); }
}
```

- `from` = `0%`, `to` = `100%`
- Percentages let you control intermediate states
- Multiple properties can be animated in one keyframe

---

## 6. Animation Properties

```css
animation-name: bounce;                    /* References @keyframes */
animation-duration: 2s;                    /* How long one cycle takes */
animation-timing-function: ease-in-out;    /* Easing per segment */
animation-delay: 0.5s;                     /* Wait before starting */
animation-iteration-count: 3;              /* Or `infinite` */
animation-direction: normal;               /* normal | reverse | alternate | alternate-reverse */
animation-fill-mode: forwards;             /* See below */
animation-play-state: running;             /* Or `paused` */
```

### `animation-direction`
| Value | Behavior |
|-------|----------|
| `normal` | Plays 0% → 100% each time |
| `reverse` | Plays 100% → 0% each time |
| `alternate` | Forward, then backward, alternating |
| `alternate-reverse` | Backward, then forward, alternating |

### `animation-fill-mode`
Controls styles **outside** the active duration:

| Value | Before start | After end |
|-------|--------------|-----------|
| `none` (default) | Base styles | Base styles |
| `forwards` | Base styles | Final keyframe styles |
| `backwards` | First keyframe styles | Base styles |
| `both` | First keyframe styles | Final keyframe styles |

### Shorthand
```css
animation: bounce 2s ease-in-out 0.5s 3 alternate forwards;
/* name duration timing delay count direction fill-mode */
```

### Multiple Animations
```css
animation: fadeIn 0.5s ease, slideUp 1s ease-out 0.2s;
```

---

## 7. Combining Transitions and Animations

They serve different purposes and can be **used together**:

- **Transitions** — Reactive, triggered by state changes (hover, focus, class toggle). Best for simple A→B changes.
- **Animations** — Proactive, self-running, multi-step, loopable. Best for complex sequences.

### Example: Card with both
```css
.card {
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  animation: pulse 2s infinite;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

@keyframes pulse {
  0%, 100% { border-color: #ccc; }
  50%      { border-color: #3498db; }
}
```

⚠️ **Conflict warning:** If both a transition and animation target the **same property**, the animation takes precedence during its active duration (animations override transitions in the cascade).

---

## 8. Performance Considerations

Animations can cause **jank** (dropped frames) if they trigger expensive layout or paint operations. Aim for 60fps (16.67ms per frame).

### The Rendering Pipeline
```
Style → Layout → Paint → Composite
```
Animating properties that trigger **Layout** or **Paint** is costly. Animating **Composite-only** properties is cheapest.

### Performance Tiers

| Tier | Properties | Cost |
|------|-----------|------|
| 🟢 Composite only | `transform`, `opacity` | Cheap — GPU-accelerated |
| 🟡 Paint | `color`, `background-color`, `box-shadow` | Moderate |
| 🔴 Layout | `width`, `height`, `top`, `left`, `margin` | Expensive — reflow |

### `will-change`
Hints to the browser which properties will animate, letting it optimize **ahead of time**.
```css
.element {
  will-change: transform, opacity;
}

.element:hover {
  transform: translateX(100px);
}
```

**Rules for `will-change`:**
- Use sparingly — every hint consumes memory (new GPU layer)
- Add it **before** the animation, remove **after** (or use it only on interactive elements)
- Don't apply to too many elements or use `will-change: all`
- Think of it as a last-resort optimization, not a first line of defense

### Best Practices
1. **Prefer `transform` and `opacity`** over layout-triggering properties.
   ```css
   /* Good */
   transform: translateX(100px);
   
   /* Bad */
   left: 100px;
   ```
2. **Use `translateZ(0)` or `translate3d()`** to force GPU layers (legacy technique, largely superseded by `will-change`).
3. **Avoid animating `box-shadow`** — animate a pseudo-element's `opacity` instead.
4. **Keep durations natural** — 150–400ms for UI feedback; longer for decorative motion.
5. **Respect `prefers-reduced-motion`:**
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```
6. **Test with DevTools** — Chrome/Firefox performance panels show paint and layout costs.

---

## Quick Reference Decision Guide

| Scenario | Use |
|----------|-----|
| Button hover color change | Transition |
| Modal fade-in on open | Transition or simple animation |
| Loading spinner | `@keyframes` with `animation-iteration-count: infinite` |
| Multi-step entrance | `@keyframes` with percentages |
| Element moves on scroll | `transform` + JS toggle class + transition |
| Continuous pulsing | `@keyframes` + `infinite` |
| State-driven movement | Transition + `transform` |

---

## Conclusion

CSS animations form a layered system: **transitions** handle simple state-driven changes, **transforms** provide efficient geometric manipulation, and **keyframe animations** enable complex autonomous sequences. Mastering easing, timing, and fill modes gives you precise control over motion feel, while performance discipline (favoring `transform`/`opacity`, judicious use of `will-change`, and respecting reduced-motion preferences) ensures smooth, accessible experiences across devices.