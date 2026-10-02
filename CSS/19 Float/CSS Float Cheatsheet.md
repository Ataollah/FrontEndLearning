# CSS Float Cheatsheet

## Core Concept
Float removes an element from normal flow and pushes it to the left or right, allowing content to wrap around it.

```css
float: left | right | none | inline-start | inline-end;
```

---

## When to Use Float

| Use Case | Why It Works |
|----------|--------------|
| **Wrapping text around images** | Original purpose of float; text flows naturally around floated element |
| **Drop caps** | Float a large first letter so paragraph text wraps around it |
| **Inline-block-like alignment** (legacy) | Floats sit side-by-side without `inline-block` whitespace issues |
| **Small, contained components** | Pull quotes, callouts, figure captions inside article text |

### Example: Text Wrapping (correct use)
```css
img.article-image {
  float: right;
  margin: 0 0 1rem 1rem;
  max-width: 300px;
}
```

---

## Why Float Is NOT Recommended for Layouts

| Problem | Explanation |
|---------|-------------|
| **Parent collapse** | Floated children are removed from flow → parent height = 0 |
| **Clearfix hacks required** | Needed `overflow: hidden` or pseudo-elements to fix collapse |
| **Fragile & unpredictable** | One forgotten `clear` breaks entire layout |
| **Source order ≠ visual order** | Accessibility/tab-order issues |
| **No equal-height columns** | Floats don't stretch to match siblings |
| **Responsive nightmare** | Media queries become complex |
| **Replaced by better tools** | Flexbox & Grid handle layout natively |

---

## The Clearfix (legacy workaround)
```css
.clearfix::after {
  content: "";
  display: table;
  clear: both;
}
```

---

## Clearing Floats

```css
clear: left | right | both | none;
```

- `clear: both` — element moves below all prior floats
- Used to "reset" flow after a floated block

---

## Modern Replacements

| Old Float Approach | Modern Alternative |
|--------------------|--------------------|
| Multi-column layout | `display: flex` or `display: grid` |
| Nav bars (horizontal) | Flexbox: `display: flex; gap: 1rem;` |
| Equal-height columns | Flexbox (default) or Grid |
| Centering | `margin: auto` + flex/grid |
| Sidebar + main | Grid: `grid-template-columns: 250px 1fr;` |
| Card grids | `display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));` |

### Example: Float vs Flex
```css
/* ❌ Old float layout */
.col { float: left; width: 33.33%; }

/* ✅ Modern flex layout */
.row { display: flex; gap: 1rem; }
.col { flex: 1; }
```

---

## Key Rules to Remember

1. **Float was designed for text wrapping**, not layout.
2. **Floated elements are removed from normal flow** — parent won't contain them.
3. **Always clear floats** in legacy code (or use clearfix).
4. **Floats don't have equal heights** — a long-standing layout pain point.
5. **Use `float` today only for**: images in text, drop caps, small inline decorations.
6. **Use Flexbox/Grid for**: page structure, columns, navs, cards, sidebars, centering.

---

## Quick Decision Guide

```
Need to wrap text around an element?      → float ✅
Need a page layout / columns / grid?      → Flexbox or Grid ❌ float
Need equal-height siblings?               → Flexbox/Grid ❌ float
Need responsive layout?                   → Flexbox/Grid ❌ float
Maintaining legacy code with floats?      → Add clearfix, migrate gradually
```