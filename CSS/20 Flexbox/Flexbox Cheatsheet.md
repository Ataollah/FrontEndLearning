# Flexbox Cheatsheet (Modern Layout Essentials)

## 1. Container Setup

```css
.container {
  display: flex; /* or inline-flex */
}
```

Turns the element into a **flex container**. Its direct children become **flex items**.

---

## 2. Flex Direction (Main Axis)

```css
.container {
  flex-direction: row;            /* default: left → right */
  flex-direction: row-reverse;    /* right → left */
  flex-direction: column;         /* top → bottom */
  flex-direction: column-reverse; /* bottom → top */
}
```

Defines the **main axis** direction.

---

## 3. Flex Wrap (Multi-line)

```css
.container {
  flex-wrap: nowrap;       /* default: single line, may overflow */
  flex-wrap: wrap;         /* wrap onto multiple lines */
  flex-wrap: wrap-reverse; /* wrap upwards */
}
```

Shorthand: `flex-flow: row wrap;` (direction + wrap)

---

## 4. Justify Content (Main Axis Alignment)

```css
.container {
  justify-content: flex-start;    /* default: packed to start */
  justify-content: flex-end;      /* packed to end */
  justify-content: center;        /* centered */
  justify-content: space-between; /* first/last at edges, equal gaps */
  justify-content: space-around;  /* equal space around each item */
  justify-content: space-evenly;  /* perfectly equal gaps everywhere */
}
```

---

## 5. Align Items (Cross Axis Alignment — single line)

```css
.container {
  align-items: stretch;    /* default: fill container height */
  align-items: flex-start; /* top of cross axis */
  align-items: flex-end;   /* bottom of cross axis */
  align-items: center;     /* centered on cross axis */
  align-items: baseline;   /* align text baselines */
}
```

---

## 6. Align Content (Cross Axis — multi-line only)

Applies **only when `flex-wrap: wrap`** and items span multiple lines.

```css
.container {
  align-content: stretch;       /* default */
  align-content: flex-start;
  align-content: flex-end;
  align-content: center;
  align-content: space-between;
  align-content: space-around;
  align-content: space-evenly;
}
```

> If single line → use `align-items` instead.

---

## 7. Flex Items — Grow / Shrink / Basis

```css
.item {
  flex-grow: 0;    /* default: don't grow */
  flex-shrink: 1;  /* default: can shrink */
  flex-basis: auto;/* default: based on content/width */
}
```

| Property | Meaning |
|---|---|
| `flex-grow` | How much **extra space** item takes (ratio) |
| `flex-shrink` | How much item **shrinks** when space is tight |
| `flex-basis` | **Initial size** before grow/shrink |

---

## 8. Flex Shorthand

```css
.item {
  flex: 0 1 auto;   /* default: grow shrink basis */
  flex: 1;          /* = 1 1 0%  → fills space equally */
  flex: auto;       /* = 1 1 auto */
  flex: none;       /* = 0 0 auto → fixed size, no flex */
  flex: 2 1 100px;  /* grow=2, shrink=1, basis=100px */
}
```

**Common patterns:**
- `flex: 1` → equal-width columns
- `flex: none` → don't resize

---

## 9. Align Self (Individual Item Alignment)

Overrides `align-items` for **one item**.

```css
.item {
  align-self: auto;       /* default: inherits align-items */
  align-self: flex-start;
  align-self: flex-end;
  align-self: center;
  align-self: stretch;
  align-self: baseline;
}
```

---

## 10. Order (Visual Reordering)

```css
.item {
  order: 0;   /* default */
  order: -1;  /* moves before default items */
  order: 1;   /* moves after default items */
}
```

Items sorted by **ascending order value**. Does **not** affect DOM/tab order.

---

## 11. Gap (Spacing Between Items)

```css
.container {
  gap: 10px;              /* row & column */
  row-gap: 20px;          /* rows only */
  column-gap: 30px;       /* columns only */
}
```

✅ Cleaner than margins — no outer edge spacing, works with wrap.

---

## Quick Reference Table

| Property | Axis | Applies To |
|---|---|---|
| `flex-direction` | Main | Container |
| `flex-wrap` | — | Container |
| `justify-content` | Main | Container |
| `align-items` | Cross | Container |
| `align-content` | Cross (multi-line) | Container |
| `gap` | Both | Container |
| `flex-grow/shrink/basis` | Main | Item |
| `align-self` | Cross | Item |
| `order` | Main | Item |

---

## Common Recipes

```css
/* Perfect centering */
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Nav bar: logo left, links right */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Equal-width columns */
.col { flex: 1; }

/* Sticky footer layout */
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.main { flex: 1; }

/* Responsive card grid */
.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.card { flex: 1 1 250px; }
```

---

## Mental Model

```
┌─────────────── MAIN AXIS → ──────────────┐
│  justify-content  (main-axis alignment)  │
│                                          │
│  C                                     C │
│  R    [item]  [item]  [item]          R │
│  O                                     O │
│  S    align-items (cross-axis)        S │
│  S                                     S │
│  ↓                                     ↓ │
└──────────────────────────────────────────┘
```

- **Main axis** = direction of `flex-direction`
- **Cross axis** = perpendicular to main axis
- `justify-*` → main axis
- `align-*` → cross axis