# Flexbox Comprehensive Cheatsheet

Flexbox (Flexible Box Layout) is a **one-dimensional layout model** that distributes space among items in a container and provides powerful alignment capabilities. It works along a **main axis** and a **cross axis**.

```
Main Axis (default: horizontal →)
┌──────────────────────────────────────────┐
│  [Item 1]   [Item 2]   [Item 3]          │  ← Cross Axis (vertical ↓)
└──────────────────────────────────────────┘
```

---

## 1. `display: flex`

Turns an element into a **flex container**. Its direct children become **flex items**.

```css
.container {
  display: flex;        /* block-level flex container */
  /* or */
  display: inline-flex; /* inline-level flex container */
}
```

- Flex items automatically become "flexible" — they can grow, shrink, and align.
- Margins never collapse in flex containers.
- Default: items are placed in a row, left-to-right.

---

## 2. `flex-direction`

Defines the **main axis** direction.

```css
.container {
  flex-direction: row;            /* default: left → right */
  flex-direction: row-reverse;    /* right → left */
  flex-direction: column;         /* top → bottom */
  flex-direction: column-reverse; /* bottom → top */
}
```

| Value | Main Axis | Cross Axis |
|-------|-----------|------------|
| `row` | Horizontal (→) | Vertical (↓) |
| `row-reverse` | Horizontal (←) | Vertical (↓) |
| `column` | Vertical (↓) | Horizontal (→) |
| `column-reverse` | Vertical (↑) | Horizontal (→) |

⚠️ `row-reverse` and `column-reverse` reverse the **start/end** meaning — `flex-start` becomes the right/bottom.

---

## 3. `flex-wrap`

Controls whether items wrap onto multiple lines.

```css
.container {
  flex-wrap: nowrap;        /* default: all on one line (may shrink) */
  flex-wrap: wrap;          /* wrap to next line (top→bottom) */
  flex-wrap: wrap-reverse;  /* wrap upward (bottom→top) */
}
```

- With `nowrap`, items shrink to fit (may cause overflow if `flex-shrink: 0`).
- With `wrap`, items maintain their size and flow onto new lines.

---

## 4. `justify-content`

Aligns items along the **main axis**.

```css
.container {
  justify-content: flex-start;    /* default: packed at start */
  justify-content: flex-end;      /* packed at end */
  justify-content: center;        /* centered */
  justify-content: space-between; /* first & last at edges, equal gaps between */
  justify-content: space-around;  /* equal space around each item */
  justify-content: space-evenly;  /* equal space between all items & edges */
}
```

**Visual (row direction):**
```
flex-start:     [A][B][C]..............
flex-end:       ..............[A][B][C]
center:         ......[A][B][C]........
space-between:  [A]....[B]....[C]
space-around:   ..[A]..[B]..[C]..
space-evenly:   ...[A]...[B]...[C]...
```

---

## 5. `align-items`

Aligns items along the **cross axis** (single line).

```css
.container {
  align-items: stretch;    /* default: fill container height */
  align-items: flex-start; /* align to cross-start */
  align-items: flex-end;   /* align to cross-end */
  align-items: center;     /* centered on cross axis */
  align-items: baseline;   /* align by text baseline */
}
```

| Value | Behavior |
|-------|----------|
| `stretch` | Items stretch to fill cross axis (if no fixed size) |
| `flex-start` | Packed at cross-start |
| `flex-end` | Packed at cross-end |
| `center` | Centered on cross axis |
| `baseline` | Aligned by first line of text |

⚠️ `baseline` is great for aligning items with different font sizes.

---

## 6. `align-content`

Aligns **multiple lines** of flex items along the cross axis. **Only works when `flex-wrap: wrap` (or `wrap-reverse`) and there are multiple lines.**

```css
.container {
  flex-wrap: wrap;
  align-content: stretch;       /* default */
  align-content: flex-start;
  align-content: flex-end;
  align-content: center;
  align-content: space-between;
  align-content: space-around;
  align-content: space-evenly;
}
```

- If only **one line** exists, `align-content` has **no effect** — use `align-items` instead.

---

## 7. `flex-grow`, `flex-shrink`, `flex-basis`

These are **item-level** properties controlling sizing.

### `flex-grow` (default: `0`)
How much an item **grows** to fill extra space.
```css
.item { flex-grow: 1; } /* takes 1 share of free space */
```

### `flex-shrink` (default: `1`)
How much an item **shrinks** when space is limited.
```css
.item { flex-shrink: 0; } /* never shrink */
```

### `flex-basis` (default: `auto`)
The **initial main-size** of an item before growing/shrinking.
```css
.item { flex-basis: 200px; } /* starts at 200px */
.item { flex-basis: 30%; }   /* percentage of container */
.item { flex-basis: auto; }  /* uses width/height or content size */
```

**Formula:**
```
Final Size = flex-basis + (free space × grow factor / sum of grow factors)
```

---

## 8. `flex` Shorthand

Combines `flex-grow`, `flex-shrink`, and `flex-basis`.

```css
.item {
  flex: 1;              /* = 1 1 0%    — equal distribution */
  flex: auto;           /* = 1 1 auto  — grow & shrink, based on content */
  flex: none;           /* = 0 0 auto  — fixed size, no grow/shrink */
  flex: 1 1 200px;      /* grow, shrink, basis */
  flex: 2 1 100px;
  flex: 0 1 auto;       /* default */
}
```

⚠️ **Common gotcha:** `flex: 1` = `flex-basis: 0%`, but `flex: auto` = `flex-basis: auto`. This affects how content sizes are considered.

---

## 9. `align-self`

Overrides `align-items` for a **single item**.

```css
.item {
  align-self: auto;        /* inherit from container */
  align-self: flex-start;
  align-self: flex-end;
  align-self: center;
  align-self: baseline;
  align-self: stretch;
}
```

Useful for highlighting or specially positioning one item.

---

## 10. `order`

Changes the **visual order** of items without modifying HTML.

```css
.item {
  order: 0;   /* default */
  order: -1;  /* moves before default items */
  order: 2;   /* moves after items with lower order */
}
```

- Lower values appear first.
- Items with equal `order` appear in source order.
- ⚠️ Does **not** affect screen readers' DOM order — accessibility concern.

---

## 11. `gap`, `row-gap`, `column-gap`

Creates spacing **between items** (not on outer edges).

```css
.container {
  gap: 10px;             /* both row & column gaps */
  gap: 20px 10px;        /* row-gap column-gap */
  row-gap: 20px;         /* space between rows */
  column-gap: 10px;      /* space between columns */
}
```

- Replaces the old margin-hack approach.
- Works with `flex-wrap: wrap` — applies between wrapped lines too.
- Not affected by `justify-content` / `align-content` distribution.

---

## 🎯 Common Patterns

### Centering (both axes)
```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

### Equal-width columns
```css
.item { flex: 1; }
```

### Fixed sidebar + fluid main
```css
.sidebar { flex: 0 0 250px; }
.main    { flex: 1; }
```

### Responsive cards with wrapping
```css
.container { display: flex; flex-wrap: wrap; gap: 16px; }
.card      { flex: 1 1 300px; }
```

### Sticky footer layout
```css
body { display: flex; flex-direction: column; min-height: 100vh; }
main { flex: 1; }
```

---

## 🧠 Quick Mental Model

| Question | Property |
|----------|----------|
| Which direction do items flow? | `flex-direction` |
| Do they wrap? | `flex-wrap` |
| Space distribution along main axis? | `justify-content` |
| Alignment on cross axis? | `align-items` |
| Multi-line cross alignment? | `align-content` |
| How do items size themselves? | `flex-grow/shrink/basis` or `flex` |
| One item different? | `align-self`, `order` |
| Spacing between items? | `gap` |

---

## ⚠️ Key Gotchas

1. **`align-content` needs wrapping** — no effect on single-line flex.
2. **`flex: 1` vs `flex: auto`** — different `flex-basis` defaults.
3. **Default `min-width: auto`** — items won't shrink below content size unless you set `min-width: 0`.
4. **`order` breaks visual/DOM order** — bad for accessibility.
5. **Reverse directions** flip start/end meaning.
6. **`gap` doesn't add outer spacing** — use padding on container if needed.
7. **Flexbox is 1D** — for 2D layouts, use **CSS Grid**.

---

## 📋 Complete Example

```css
.container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  align-content: flex-start;
  gap: 16px;
  min-height: 300px;
}

.item {
  flex: 1 1 200px;
  order: 0;
  align-self: stretch;
}

.item.featured {
  flex: 2 1 300px;
  order: -1;
  align-self: flex-start;
}
```

This covers the entire essential Flexbox toolkit — mastering these properties gives you full control over modern one-dimensional layouts.