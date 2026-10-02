# CSS Positioning Cheatsheet

## Quick Reference Table

| Position | In Flow? | Offset Relative To | Scrolls With Page? | Creates Stacking Context? |
|----------|----------|-------------------|-------------------|--------------------------|
| `static` | ✅ Yes | N/A (offsets ignored) | ✅ Yes | ❌ No |
| `relative` | ✅ Yes | Its own normal position | ✅ Yes | ✅ Yes (with z-index) |
| `absolute` | ❌ No | Nearest positioned ancestor | ✅ Yes | ✅ Yes (with z-index) |
| `fixed` | ❌ No | Viewport | ❌ No | ✅ Yes |
| `sticky` | ✅ Yes | Nearest scroll container | Until threshold, then fixed | ✅ Yes |

---

## 1. Static Positioning (Default)

```css
.box {
  position: static; /* default */
}
```
- **Normal document flow**
- `top`, `right`, `bottom`, `left`, `z-index` are **ignored**
- Every element starts here

---

## 2. Relative Positioning

```css
.box {
  position: relative;
  top: 20px;    /* moves DOWN 20px from original spot */
  left: 10px;   /* moves RIGHT 10px */
}
```
- **Stays in normal flow** (original space is preserved)
- Offsets are **relative to its own original position**
- Great for:
  - Small nudges
  - Creating a **positioning context** for absolute children

⚠️ `top` moves down, `bottom` moves up (they don't stack)

---

## 3. Absolute Positioning

```css
.parent { position: relative; }  /* positioning context */

.child {
  position: absolute;
  top: 0;
  right: 0;
}
```

### Absolute vs Relative Parent

| Parent | Child positions relative to... |
|--------|-------------------------------|
| `position: static` (default) | The **viewport/document** (or nearest positioned ancestor far up) |
| `position: relative` | The **parent's padding box** ✅ preferred |
| `position: absolute` | The absolute parent |
| `position: fixed` | The fixed parent |

**Key rules:**
- **Removed from flow** — siblings collapse into its space
- Anchored to **nearest ancestor with `position` ≠ static**
- If none found → anchored to **initial containing block** (viewport)
- Common pattern: `parent: relative` + `child: absolute`

```css
/* Center an absolute element */
.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

---

## 4. Fixed Positioning

```css
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
}
```
- **Removed from flow**
- Positioned relative to the **viewport** (not any parent)
- **Does NOT scroll** with the page
- Use cases: sticky headers, floating buttons, modals, chat widgets

⚠️ Ignored by ancestor `transform`, `filter`, `perspective` — those become the containing block instead.

---

## 5. Sticky Positioning

```css
.sticky-header {
  position: sticky;
  top: 0;   /* required — the threshold */
  z-index: 10;
}
```
- **Hybrid**: behaves `relative` until it hits the threshold, then `fixed`
- **Stays in flow** (space preserved)
- Sticks **within its parent container** — stops when parent scrolls out
- **Requires** at least one offset (`top`, `bottom`, `left`, `right`)
- Common use: table headers, section titles, sidebars

```css
/* Sticky sidebar */
.sidebar {
  position: sticky;
  top: 20px;
  align-self: flex-start; /* needed in flexbox */
}
```

⚠️ Doesn't work if any ancestor has `overflow: hidden/scroll/auto` (unless that ancestor is the scroll container).

---

## 6. Z-index and Stacking Context

```css
.modal {
  position: fixed;
  z-index: 1000;
}
```

**Rules:**
- Only works on **positioned** elements (or flex/grid children)
- Higher `z-index` = closer to viewer
- Default `z-index: auto` (= 0 for stacking)

### New Stacking Context is created by:
- `position` + `z-index` (not `auto`)
- `opacity < 1`
- `transform`, `filter`, `perspective`, `will-change`
- `isolation: isolate`
- `position: fixed` or `sticky` (always)

**Critical rule:** A child's `z-index` is **trapped inside** its parent's stacking context.
```css
/* Child z-index 9999 will NEVER beat parent's sibling with z-index 1 */
.parent { position: relative; z-index: 1; }
.child  { position: absolute; z-index: 9999; } /* trapped! */
```

---

## 7. Offsets: Top, Right, Bottom, Left

```css
.box {
  position: absolute;
  top: 10px;
  right: 20px;
  bottom: 30px;
  left: 40px;
}
```

| Property | Effect | Opposite behavior |
|----------|--------|-------------------|
| `top` | Distance from top edge | If both `top` & `bottom` set → height determined |
| `right` | Distance from right edge | If both `left` & `right` set → width determined |
| `bottom` | Distance from bottom edge | — |
| `left` | Distance from left edge | — |

**Useful patterns:**
```css
/* Stretch to fill parent */
.fill { position: absolute; inset: 0; } /* shorthand for all 4 */

/* Pin to bottom */
.bottom { position: absolute; bottom: 0; left: 0; right: 0; }

/* Negative values allowed */
.overlap { position: relative; top: -10px; }
```

`inset: 0` = `top:0; right:0; bottom:0; left:0`

---

## Mental Model Summary

```
static    → normal flow, no offsets
relative  → normal flow + offsets (nudge from self)
absolute  → removed, offset from positioned ancestor
fixed     → removed, offset from viewport
sticky    → normal flow until threshold, then fixed
```

## Common Gotchas

1. **Absolute without positioned parent** → jumps to page top-left
2. **Fixed broken by `transform`** on ancestor
3. **Sticky not working** → missing `top`/`bottom`, or `overflow: hidden` ancestor
4. **z-index not working** → element isn't positioned, or trapped in parent's stacking context
5. **Margins still apply** to relative elements; offsets are on top of margins