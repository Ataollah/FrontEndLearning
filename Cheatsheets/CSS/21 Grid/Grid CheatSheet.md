# CSS Grid: A Comprehensive Guide to Modern Layout

CSS Grid is a two-dimensional layout system that lets you control both **rows and columns** simultaneously. Unlike Flexbox (which is primarily one-dimensional), Grid is designed for full-page layouts and complex component structures.

---

## 1. `display: grid`

The entry point. Applying `display: grid` to an element turns it into a **grid container**, and its direct children become **grid items**.

```css
.container {
  display: grid;
}
```

**Key concepts:**
- **Grid container** — the parent element
- **Grid items** — direct children only (grandchildren are unaffected)
- **Grid lines** — the invisible lines that form the grid structure
- **Grid tracks** — rows and columns between lines
- **Grid cells** — the intersection of a row and column

```html
<div class="container">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

Without defining tracks, items stack in a single column (default behavior).

---

## 2. `grid-template-columns` and `grid-template-rows`

These define the **explicit grid** — the rows and columns you declare.

```css
.container {
  display: grid;
  grid-template-columns: 200px 200px 200px; /* 3 fixed columns */
  grid-template-rows: 100px 100px;          /* 2 fixed rows */
}
```

You can mix units:

```css
grid-template-columns: 200px 1fr 30%; /* fixed, flexible, percentage */
```

**Named lines** are also possible:

```css
grid-template-columns: [sidebar-start] 250px [sidebar-end main-start] 1fr [main-end];
```

---

## 3. Fractional Units (`fr`)

The `fr` unit represents a **fraction of the available free space** in the grid container. It's the most powerful sizing tool in Grid.

```css
.container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
}
```

- Total = 4 parts. The middle column gets `2/4` (50%), the others get `1/4` each.
- `fr` distributes space **after** fixed sizes and gaps are accounted for.

```css
grid-template-columns: 200px 1fr 1fr;
/* The 200px is fixed; remaining space is split between two 1fr columns */
```

**Important nuance:** `fr` behaves like `minmax(auto, Xfr)` by default — meaning a track won't shrink below its content's min-content size unless you use `minmax(0, 1fr)`.

---

## 4. `repeat()` Function

Avoids repetitive declarations. It repeats track definitions.

```css
/* Instead of: 1fr 1fr 1fr 1fr 1fr */
grid-template-columns: repeat(5, 1fr);

/* Mixed patterns */
grid-template-columns: 200px repeat(3, 1fr) 200px;
```

**Repeat with multiple values:**

```css
grid-template-columns: repeat(3, 100px 1fr); 
/* → 100px 1fr 100px 1fr 100px 1fr */
```

**Auto-repetition (combines with auto-fill/auto-fit):**

```css
grid-template-columns: repeat(auto-fill, 200px);
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
```

---

## 5. `minmax()` Function

Sets a **minimum and maximum size** for a track — the track grows/shrinks within that range.

```css
grid-template-columns: minmax(200px, 1fr) minmax(100px, 300px);
```

- First column: at least `200px`, grows to fill available space.
- Second column: at least `100px`, never exceeds `300px`.

**Common pattern — responsive cards without media queries:**

```css
grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
```

Each column is at least 280px wide but grows to share space evenly.

---

## 6. `auto-fill` vs `auto-fit`

These keywords tell `repeat()` how many tracks to create when using `minmax()`.

### `auto-fill`
Creates **as many tracks as fit**, even if some are empty.

```css
grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
```
If the container is 1000px wide → 5 tracks of 200px. If only 3 items exist, **2 empty tracks remain**, so items stay at 200px.

### `auto-fit`
Creates as many tracks as fit, then **collapses empty tracks** so items stretch to fill.

```css
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
```
Same 1000px container, 3 items → 3 items stretch to ~333px each. **No wasted space.**

| Feature | `auto-fill` | `auto-fit` |
|---|---|---|
| Empty tracks | Kept | Collapsed |
| Items stretch? | No (unless space fills) | Yes |
| Best for | Consistent column widths | Centered, stretching content |

---

## 7. Grid Gap (`gap`, `row-gap`, `column-gap`)

Creates spacing **between** tracks (not on the outer edges). This is the modern replacement for margin hacks.

```css
.container {
  display: grid;
  gap: 20px;                /* both row and column */
  row-gap: 10px;            /* rows only */
  column-gap: 30px;         /* columns only */
  gap: 10px 30px;           /* row-gap column-gap */
}
```

**Advantages over margins:**
- No margin collapsing issues
- No need for `:last-child` resets
- Works with `fr` and percentages cleanly

---

## 8. `grid-template-areas` (Named Areas)

A **visual, ASCII-art-like** way to define layouts. Extremely readable and great for page-level structure.

```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header  header"
    "sidebar main"
    "footer  footer";
  gap: 10px;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }
```

**Rules:**
- Each string = one row
- Each word = a column cell
- A `.` (dot) means an empty cell
- Areas must be **rectangular** — no L-shapes

**Empty cells example:**
```css
grid-template-areas:
  "header header"
  ".      main"
  "footer footer";
```

**Responsive trick:** Redefine `grid-template-areas` in a media query to completely rearrange the layout — no need to touch individual items.

```css
@media (max-width: 600px) {
  .container {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "main"
      "sidebar"
      "footer";
  }
}
```

---

## 9. `grid-column` and `grid-row` (Item Placement)

Controls where an item sits using **grid line numbers** or **span**.

### Line-based placement
Grid lines are numbered starting at **1** from the top-left.

```css
.item {
  grid-column: 1 / 3;   /* from line 1 to line 3 (spans 2 columns) */
  grid-row: 2 / 4;      /* from line 2 to line 4 (spans 2 rows) */
}
```

### Shorthand with `span`
```css
.item {
  grid-column: 2 / span 2; /* start at line 2, span 2 columns */
  grid-row: span 3;        /* span 3 rows from auto placement */
}
```

### Longhand properties
```css
grid-column-start: 1;
grid-column-end: 3;
grid-row-start: 1;
grid-row-end: 3;
```

### Negative line numbers
Count from the **end** of the grid. `-1` is the last line.

```css
.item {
  grid-column: 1 / -1;  /* full width — first to last line */
}
```

This is the go-to trick for full-width items inside a grid.

### Overlapping items
Grid allows overlap (unlike tables):

```css
.a { grid-column: 1 / 3; grid-row: 1 / 3; }
.b { grid-column: 2 / 4; grid-row: 2 / 4; z-index: 1; }
```

Useful for hero images with overlaid text.

### `grid-area` shorthand
```css
grid-area: row-start / column-start / row-end / column-end;
grid-area: 1 / 2 / 3 / 4;
```

---

## Putting It All Together

A responsive, full-page layout using every concept:

```css
.layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header  header"
    "sidebar main"
    "footer  footer";
  gap: 1rem;
  min-height: 100vh;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }

/* Responsive card grid inside main */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

/* A featured card spanning two columns */
.cards .featured {
  grid-column: span 2;
}

@media (max-width: 700px) {
  .layout {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "main"
      "sidebar"
      "footer";
  }
}
```

---

## Quick Reference Cheat Sheet

| Property | Purpose |
|---|---|
| `display: grid` | Activate grid on container |
| `grid-template-columns/rows` | Define explicit tracks |
| `fr` | Fraction of free space |
| `repeat(n, ...)` | Repeat track definitions |
| `minmax(min, max)` | Clamp track size |
| `auto-fill` | Keep empty tracks |
| `auto-fit` | Collapse empty tracks |
| `gap / row-gap / column-gap` | Space between tracks |
| `grid-template-areas` | Named layout regions |
| `grid-column / grid-row` | Place items by line/span |
| `grid-area` | Shorthand placement / named area |

---

## Key Mental Models

1. **Grid lines** (numbered, not tracks) are what you reference for placement.
2. **Explicit grid** = what you declare; **implicit grid** = auto-generated for overflow items.
3. **`fr` distributes free space**, not total space — subtract fixed sizes and gaps first.
4. **`auto-fit` stretches, `auto-fill` preserves** — the single most important responsive decision.
5. **`grid-template-areas` is the most maintainable** way to build page-level layouts.
6. **Negative line numbers** (`-1`) are ideal for "full-width" and edge-pinned items.

Master these nine concepts and you can build virtually any modern web layout — from dashboards to magazine-style pages — with clean, semantic, responsive CSS.