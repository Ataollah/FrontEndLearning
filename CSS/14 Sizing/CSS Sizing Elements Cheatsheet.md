# CSS Sizing Elements Cheatsheet

## 1. Width & Height

```css
.box {
  width: auto;        /* Default. Content-based (block: fills parent) */
  width: 300px;       /* Fixed */
  width: 50%;         /* % of containing block */
  width: 20em;        /* Relative to font-size */
  width: 30rem;       /* Relative to root font-size */
  width: 50vw;        /* % of viewport width */
  width: 50vh;        /* % of viewport height */

  height: auto;       /* Content-based */
  height: 200px;
  height: 100%;
}
```

**Key rules**
- `width: 100%` → fills parent's content box (can overflow with padding unless `box-sizing: border-box`)
- `height: 100%` → only works if parent has an explicit height
- `%` resolves against the containing block's width (for width) or height (for height)

---

## 2. Min / Max Width & Height

```css
.box {
  min-width: 200px;
  max-width: 800px;      /* common: max-width: 65ch for readable text */
  min-height: 100px;
  max-height: 500px;
}
```

**Priority order** (when conflicting):
- `min-width` > `width` > `max-width`
- `min-height` > `height` > `max-height`

**Common patterns**
```css
/* Responsive container */
.container {
  width: 90%;
  max-width: 1200px;
  margin-inline: auto;
}

/* Prevent image overflow */
img {
  max-width: 100%;
  height: auto;
}
```

---

## 3. Aspect Ratio

```css
.box {
  aspect-ratio: 16 / 9;   /* width : height */
  aspect-ratio: 1;        /* square */
  aspect-ratio: 4 / 3;
  aspect-ratio: auto;     /* default */
}
```

**How it works**
- If `width` is set → `height` is computed (and vice versa)
- If neither set → uses content size, ratio is a preference
- `auto` lets replaced elements (img, video) use their intrinsic ratio

```css
/* Responsive 16:9 box */
.video {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
}

/* Square thumbnail */
.thumb {
  width: 200px;
  aspect-ratio: 1;
  object-fit: cover;
}
```

---

## 4. Intrinsic Sizing Keywords

| Keyword | Meaning |
|---|---|
| `min-content` | Smallest size without overflow (longest word / smallest unit) |
| `max-content` | Size needed to fit content with no wrapping |
| `fit-content` | Shrinks to content, but never exceeds available space |
| `fit-content(limit)` | Like `fit-content`, but capped at `limit` |

```css
.box       { width: min-content; }
.box       { width: max-content; }
.box       { width: fit-content; }          /* = min(max-content, max(min-content, available)) */
.box       { width: fit-content(300px); }   /* capped */
```

**Practical examples**
```css
/* Shrink-to-fit button */
.btn { width: fit-content; }

/* Prevent paragraph from being too wide */
p { max-width: 65ch; }

/* Grid column that hugs content */
.grid { grid-template-columns: max-content 1fr; }

/* Truncate long words gracefully */
.tag { width: min-content; }
```

---

## 5. Bonus: Related Sizing Tools

```css
/* box-sizing */
* { box-sizing: border-box; }  /* padding+border included in width/height */

/* Logical properties */
width: 100px;      → inline-size: 100px;
height: 100px;     → block-size: 100px;

/* Viewport units */
width: 100dvw;     /* dynamic viewport width (mobile-safe) */
height: 100dvh;
height: 100svh;    /* small viewport */
height: 100lvh;    /* large viewport */

/* clamp() for fluid sizing */
width: clamp(200px, 50%, 800px);

/* min() / max() */
width: min(90%, 1200px);
width: max(300px, 50%);
```

---

## Quick Decision Guide

| Goal | Use |
|---|---|
| Fill parent | `width: 100%` |
| Fixed size | `width: 300px` |
| Responsive cap | `max-width: 1200px` |
| Never shrink below | `min-width: 200px` |
| Proportional box | `aspect-ratio` |
| Hug content | `width: fit-content` |
| Never wrap | `width: max-content` |
| Smallest possible | `width: min-content` |
| Fluid size | `clamp()` / `min()` / `max()` |