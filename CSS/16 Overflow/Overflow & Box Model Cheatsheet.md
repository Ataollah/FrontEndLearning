# CSS Overflow & Box Model Cheatsheet

## 1. Overflow Property

Controls how content that doesn't fit in its container is displayed.

```css
.container {
  overflow: visible | hidden | scroll | auto;
}
```

| Value | Behavior |
|-------|----------|
| `visible` | **Default.** Content spills out of the box. |
| `hidden` | Content is clipped; no scrollbars. Hidden content is inaccessible. |
| `scroll` | Always shows scrollbars (even if content fits). |
| `auto` | Scrollbars appear **only when needed**. Preferred for most cases. |
| `clip` | Like `hidden`, but no scrolling programmatically either (modern). |

```css
/* Example */
.box {
  width: 200px;
  height: 100px;
  overflow: auto; /* scrolls only if content overflows */
}
```

**Pro tip:** `overflow: hidden` also creates a **Block Formatting Context (BFC)**, which can prevent margin collapse and contain floats.

---

## 2. Overflow-x and Overflow-y

Control each axis independently.

```css
.box {
  overflow-x: auto;   /* horizontal scrolling */
  overflow-y: hidden; /* clip vertically */
}
```

### ⚠️ Interaction Rule
If one axis is set to `visible` and the other to anything else (`auto`, `hidden`, `scroll`), the `visible` value is computed as `auto`.

```css
.box {
  overflow-x: visible;
  overflow-y: scroll;
  /* overflow-x actually becomes `auto` */
}
```

### Common use cases
```css
/* Horizontal scroll only */
.gallery {
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
}

/* Vertically scrollable list with hidden horizontal */
.list {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
}
```

---

## 3. Margin Collapsing

Adjacent vertical margins **combine into one** (the larger wins).

### When it happens
1. **Adjacent siblings** (top/bottom margins touch)
2. **Parent & first/last child** (no padding, border, or content between)
3. **Empty elements** (top and bottom margins collapse together)

```css
/* Siblings collapse */
.a { margin-bottom: 20px; }
.b { margin-top: 30px; }
/* Result: 30px gap, not 50px */
```

### When it does NOT happen
- Horizontal (left/right) margins — **never collapse**
- Flexbox / Grid children
- Elements with `overflow` other than `visible`
- Elements with `padding`, `border`, or `height` separating parent/child
- Floated or absolutely positioned elements

### Prevention tricks
```css
.parent {
  overflow: hidden;   /* creates BFC */
  /* or */
  padding: 1px;
  /* or */
  display: flow-root; /* modern, cleanest */
}
```

---

## 4. Padding & Margin Shorthand

Both follow the same 4-value pattern.

```css
padding: top right bottom left;   /* 4 values */
padding: top horizontal bottom;   /* 3 values */
padding: vertical horizontal;     /* 2 values */
padding: all;                     /* 1 value  */
```

### Examples
```css
.box {
  padding: 10px 20px 30px 40px; /* T R B L */
  padding: 10px 20px 30px;      /* T | R&L | B */
  padding: 10px 20px;           /* T&B | R&L */
  padding: 10px;                /* all sides */
}

.card {
  margin: 0 auto; /* center horizontally (block elements) */
}
```

### Key difference
| | Padding | Margin |
|-|---------|--------|
| Space | **Inside** border | **Outside** border |
| Background | Affected by background | Transparent |
| Negative values | ❌ Not allowed | ✅ Allowed |
| Collapsing | Never | Yes (vertical) |

---

## 5. Negative Margins in CSS

Allowed on margins only — pulls elements closer or overlaps them.

### Common uses

**1. Pull element outward (full-bleed inside padded parent)**
```css
.parent { padding: 20px; }
.child  { margin: 0 -20px; } /* stretches to parent edges */
```

**2. Overlap elements**
```css
.badge {
  margin-top: -10px; /* pulls up over previous element */
}
```

**3. Remove gap from last child**
```css
.list > *:last-child {
  margin-bottom: -8px;
}
```

**4. Center + stretch a row**
```css
.row {
  margin: 0 -15px; /* offsets column padding */
}
.col {
  padding: 0 15px;
}
```

### ⚠️ Gotchas
- Negative margins **do not collapse** the same way positive ones do — a negative + positive margin **sums** them.
- Can cause elements to overflow their container → combine with `overflow: hidden` or padding to clip.
- Avoid on flex/grid items for layouts you want predictable.

---

## Quick Reference Summary

```css
/* Overflow */
overflow: auto;              /* scroll when needed */
overflow-x: hidden;          /* clip one axis */
overflow: hidden;            /* BFC + clip */

/* Collapse prevention */
display: flow-root;          /* cleanest */
overflow: hidden;            /* also works */

/* Shorthand order: T R B L */
margin: 10px 20px 10px 20px;
padding: 10px 20px;

/* Centering */
margin: 0 auto;

/* Negative margin overlap */
margin-top: -8px;
```