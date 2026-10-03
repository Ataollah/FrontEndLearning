# CSS Borders Cheatsheet

## 1. Border Width, Style, Color

### Shorthand
```css
border: 2px solid red;
border: 1px dashed #333;
border: 3px dotted blue;
border: 4px double green;
border: medium groove purple;   /* thin | medium | thick */
```

### Longhand
```css
border-width: 2px;              /* thin | medium | thick | length */
border-style: solid;            /* required for border to show */
border-color: red;
```

### Border Styles
| Value | Look |
|-------|------|
| `solid` | Single solid line |
| `dashed` | Series of dashes |
| `dotted` | Series of dots |
| `double` | Two parallel lines |
| `groove` | 3D carved-in look |
| `ridge` | 3D raised look |
| `inset` | 3D embedded |
| `outset` | 3D embossed |
| `none` | No border (default) |
| `hidden` | No border (used in table collapse) |

> ⚠️ **`border-style` is mandatory** — width/color alone won't render a border.

---

## 2. Border Radius (Rounded Corners)

```css
border-radius: 10px;                     /* all corners */
border-radius: 10px 20px;                /* TL/BR | TR/BL */
border-radius: 10px 20px 30px;           /* TL | TR/BL | BR */
border-radius: 10px 20px 30px 40px;      /* TL | TR | BR | BL */

/* Per-corner */
border-top-left-radius: 10px;
border-top-right-radius: 10px;
border-bottom-right-radius: 10px;
border-bottom-left-radius: 10px;

/* Elliptical radius (horizontal / vertical) */
border-radius: 50px / 25px;

/* Circle */
border-radius: 50%;
```

---

## 3. Individual Border Sides

```css
border-top: 2px solid red;
border-right: 1px dashed blue;
border-bottom: 3px dotted green;
border-left: 4px double black;

/* Longhand per side */
border-top-width: 2px;
border-top-style: solid;
border-top-color: red;

/* Remove a specific side */
border-right: none;
```

**Trick — one-sided border (e.g., left accent):**
```css
border-left: 4px solid #007bff;
```

---

## 4. Border Image (Brief)

Uses an image as the border instead of a solid color.

```css
border-image: url(border.png) 30 round;
/* shorthand: source slice / width / outset repeat */
```

### Longhand
```css
border-image-source: url(border.png);
border-image-slice: 30;         /* how image is divided (px or %) */
border-image-width: 10px;       /* border thickness */
border-image-outset: 0;         /* how far border extends beyond box */
border-image-repeat: stretch;   /* stretch | repeat | round | space */
```

**Example:**
```css
.element {
  border: 10px solid transparent;
  border-image: url(border.png) 30 stretch;
}
```

> 📝 `border-image` **ignores** `border-radius` in most browsers.

---

## 5. Outline (vs Border)

| Feature | `border` | `outline` |
|---------|----------|-----------|
| Affects layout/box size | ✅ Yes | ❌ No (drawn outside) |
| Follows `border-radius` | ✅ Yes | ⚠️ Modern browsers only |
| Can target sides | ✅ Yes | ❌ No (all sides only) |
| Used for focus rings | Sometimes | ✅ Primary use |

```css
outline: 2px solid blue;
outline-offset: 4px;            /* gap between border and outline */

/* Remove default focus outline (accessibility caution!) */
outline: none;

/* Better: custom focus style */
:focus-visible {
  outline: 3px dashed #ff6600;
  outline-offset: 2px;
}
```

> ⚠️ Never remove outlines without providing an accessible alternative.

---

## 6. Box Decoration Break

Controls how **background, border, and padding** behave when text breaks across lines.

```css
box-decoration-break: slice;    /* default — box treated as one unit */
box-decoration-break: clone;    /* each fragment gets its own border/padding/radius */
```

**Use case — inline highlighted text with padding & rounded corners:**
```css
mark {
  background: yellow;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid orange;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}
```
With `clone`, if the text wraps to a new line, **each line** gets its own border, radius, and padding instead of one broken box.

---

## Quick Reference Cheat

```css
/* All-in-one */
border: 2px solid #333;
border-radius: 8px;
border-left: 4px solid red;
outline: 2px dashed blue;
outline-offset: 3px;
box-decoration-break: clone;
border-image: url(x.png) 30 round;
```