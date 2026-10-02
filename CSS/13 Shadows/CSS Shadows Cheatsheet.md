# CSS Shadows Cheatsheet

## 1. Box Shadow (`box-shadow`)

**Syntax:**
```css
box-shadow: [inset] offset-x offset-y [blur-radius] [spread-radius] [color];
```

| Value | Description |
|-------|-------------|
| `inset` | Optional. Shadow inside the element |
| `offset-x` | Horizontal shift (required, can be negative) |
| `offset-y` | Vertical shift (required, can be negative) |
| `blur-radius` | Optional. Larger = more blurred |
| `spread-radius` | Optional. Positive = larger shadow, negative = smaller |
| `color` | Any valid CSS color |

**Examples:**
```css
/* Simple drop shadow */
box-shadow: 4px 4px 8px rgba(0,0,0,0.3);

/* Inset shadow (pressed-in look) */
box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);

/* Spread only */
box-shadow: 0 0 0 3px red;

/* All together */
box-shadow: inset 2px 2px 6px 2px rgba(0,0,0,0.4);
```

**Tips:**
- Use `0 0 0 3px color` for outline-style rings (better than `outline` for rounded corners).
- Negative spread shrinks the shadow — great for tight edges.
- Blur-radius `0` = sharp shadow.

---

## 2. Text Shadow (`text-shadow`)

**Syntax:**
```css
text-shadow: offset-x offset-y [blur-radius] [color];
```
*(No `inset` or `spread` support.)*

**Examples:**
```css
/* Simple */
text-shadow: 1px 1px 2px black;

/* Glow */
text-shadow: 0 0 10px #fff, 0 0 20px #0ff;

/* Outline (no blur, offset in all directions) */
text-shadow:
  -1px -1px 0 #000,
   1px -1px 0 #000,
  -1px  1px 0 #000,
   1px  1px 0 #000;

/* Letterpress / engraved */
text-shadow: 0 1px 0 #fff, 0 -1px 0 rgba(0,0,0,0.5);
```

**Tips:**
- Multiple shadows are comma-separated and stack.
- For a crisp outline, use no blur and offset in 4–8 directions.
- For embossed text, use a light shadow on top + dark shadow below (or vice versa).

---

## 3. Drop Shadow Filter (`filter: drop-shadow()`)

**Syntax:**
```css
filter: drop-shadow(offset-x offset-y [blur-radius] [color]);
```
*(No `inset`, no `spread`.)*

**Key difference from `box-shadow`:**
- Follows the **alpha shape** of the element (including transparent PNGs, SVG shapes, clipped elements).
- `box-shadow` always follows the **border box** (rectangle).

**Examples:**
```css
/* Basic */
filter: drop-shadow(4px 4px 6px rgba(0,0,0,0.5));

/* PNG with transparency — shadow hugs the shape */
img.logo {
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));
}

/* Glow effect */
filter: drop-shadow(0 0 8px cyan);
```

**Tips:**
- Works on any element, including inline SVG and `<img>`.
- GPU-accelerated, but heavy on many elements.
- Can chain: `filter: drop-shadow(...) drop-shadow(...);`

---

## 4. Multiple Shadows in CSS

Comma-separate values — they render **front to back** (first = topmost).

```css
/* Layered box shadows */
box-shadow:
  0 1px 2px rgba(0,0,0,0.10),
  0 2px 4px rgba(0,0,0,0.10),
  0 4px 8px rgba(0,0,0,0.10),
  0 8px 16px rgba(0,0,0,0.10);

/* Neumorphism (soft UI) */
box-shadow:
  8px 8px 16px #b8b9be,
 -8px -8px 16px #ffffff;

/* Layered text glow */
text-shadow:
  0 0 5px #fff,
  0 0 10px #fff,
  0 0 20px #ff00de,
  0 0 40px #ff00de;

/* Layered drop-shadow filter */
filter:
  drop-shadow(0 1px 1px rgba(0,0,0,0.2))
  drop-shadow(0 4px 8px rgba(0,0,0,0.2));
```

---

## Comparison Table

| Feature | `box-shadow` | `text-shadow` | `drop-shadow()` |
|---|---|---|---|
| Follows shape | ❌ (border box) | ❌ (text glyphs) | ✅ (alpha shape) |
| `inset` | ✅ | ❌ | ❌ |
| `spread` | ✅ | ❌ | ❌ |
| Multiple | ✅ | ✅ | ✅ (chain filters) |
| Applies to | Any element | Text only | Any element |
| Performance | Good | Good | Heavier |

---

## Practical Recipes

```css
/* Material card */
box-shadow:
  0 1px 3px rgba(0,0,0,0.12),
  0 1px 2px rgba(0,0,0,0.24);

/* Floating button */
box-shadow:
  0 3px 6px rgba(0,0,0,0.16),
  0 3px 6px rgba(0,0,0,0.23);

/* Inner input well */
box-shadow: inset 0 2px 4px rgba(0,0,0,0.15);

/* Neon text */
color: #fff;
text-shadow:
  0 0 7px #fff,
  0 0 10px #fff,
  0 0 21px #fff,
  0 0 42px #0fa,
  0 0 82px #0fa;

/* Icon shadow that hugs the glyph */
filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3));
```