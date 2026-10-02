# CSS Gradients Cheatsheet

## 1. Linear Gradients

```css
/* Basic syntax */
background: linear-gradient(direction, color-stop1, color-stop2, ...);

/* Direction keywords */
linear-gradient(to right, red, blue)
linear-gradient(to left, red, blue)
linear-gradient(to top, red, blue)
linear-gradient(to bottom, red, blue)
linear-gradient(to bottom right, red, blue)  /* diagonal */

/* Angle-based (0deg = to top, 90deg = to right) */
linear-gradient(45deg, red, blue)
linear-gradient(180deg, red, blue)  /* = to bottom */
linear-gradient(-90deg, red, blue)  /* = to left */

/* Turn/radian units */
linear-gradient(0.25turn, red, blue)  /* = 90deg */
linear-gradient(1.57rad, red, blue)
```

## 2. Radial Gradients

```css
/* Basic syntax */
background: radial-gradient(shape size at position, color-stop1, ...);

/* Shapes */
radial-gradient(circle, red, blue)
radial-gradient(ellipse, red, blue)  /* default */

/* Size keywords */
radial-gradient(circle closest-side, red, blue)
radial-gradient(circle closest-corner, red, blue)
radial-gradient(circle farthest-side, red, blue)
radial-gradient(circle farthest-corner, red, blue)  /* default */

/* Explicit size */
radial-gradient(circle 100px, red, blue)
radial-gradient(ellipse 200px 100px, red, blue)

/* Position */
radial-gradient(circle at center, red, blue)
radial-gradient(circle at top left, red, blue)
radial-gradient(circle at 30% 70%, red, blue)
```

## 3. Conic Gradients

```css
/* Basic syntax */
background: conic-gradient(from angle at position, color-stop1, ...);

/* Simple */
conic-gradient(red, blue, green)
conic-gradient(from 45deg, red, blue)
conic-gradient(at 50% 50%, red, blue)

/* Pie chart */
conic-gradient(red 0deg 90deg, blue 90deg 180deg, green 180deg 360deg)

/* Percentage stops */
conic-gradient(red 0% 25%, blue 25% 50%, green 50% 100%)
```

## 4. Repeating Gradients

```css
/* Repeating linear */
repeating-linear-gradient(45deg, red 0 10px, blue 10px 20px)

/* Repeating radial */
repeating-radial-gradient(circle, red 0 10px, blue 10px 20px)

/* Repeating conic */
repeating-conic-gradient(red 0 15deg, blue 15deg 30deg)

/* Stripes example */
repeating-linear-gradient(
  90deg,
  #000 0 20px,
  #fff 20px 40px
)
```

## 5. Color Stops

```css
/* Explicit positions */
linear-gradient(red 0%, yellow 50%, blue 100%)

/* Pixel/em/rem stops */
linear-gradient(red 0px, blue 100px)

/* Hard stops (sharp transition) */
linear-gradient(red 0 50%, blue 50% 100%)

/* Color hints (midpoint control) */
linear-gradient(red, 30%, blue)

/* Two-position stops (shorthand) */
linear-gradient(red 0 20%, blue 20% 100%)

/* Transparent colors */
linear-gradient(rgba(255,0,0,0), rgba(0,0,255,1))
linear-gradient(transparent, black)

/* Modern color spaces */
linear-gradient(in oklab, red, blue)
linear-gradient(in hsl longer hue, red, blue)
```

## 6. Multiple Color Stops

```css
/* Rainbow */
linear-gradient(
  to right,
  red, orange, yellow, green, blue, indigo, violet
)

/* Distribute evenly */
linear-gradient(red, yellow, blue)  /* 0%, 50%, 100% */

/* Mixed spacing */
linear-gradient(red, yellow 20%, blue 80%, purple)
```

## 7. Gradient Patterns

```css
/* Stripes */
repeating-linear-gradient(45deg, #000 0 10px, #fff 10px 20px)

/* Checkerboard */
background:
  repeating-conic-gradient(#000 0% 25%, #fff 0% 50%)
  50% / 40px 40px;

/* Polka dots */
background:
  radial-gradient(circle, #000 20%, transparent 20%) 0 0 / 30px 30px,
  radial-gradient(circle, #000 20%, transparent 20%) 15px 15px / 30px 30px;

/* Grid lines */
background:
  linear-gradient(#ccc 1px, transparent 1px) 0 0 / 20px 20px,
  linear-gradient(90deg, #ccc 1px, transparent 1px) 0 0 / 20px 20px;

/* Zigzag */
background: linear-gradient(135deg, #000 25%, transparent 25%) 0 0,
            linear-gradient(225deg, #000 25%, transparent 25%) 0 0;
background-size: 20px 20px;
background-color: #fff;

/* Diagonal stripes */
repeating-linear-gradient(
  -45deg,
  #ee7752, #ee7752 10px,
  #e73c7e 10px, #e73c7e 20px
)
```

## 8. Gradient Text

```css
.gradient-text {
  background: linear-gradient(90deg, #f00, #00f);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}
```

## 9. Multiple Gradient Layers

```css
/* Comma-separate layers — first is on top */
background:
  linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),
  url('image.jpg');

/* Blend multiple gradients */
background:
  radial-gradient(circle at 20% 30%, rgba(255,0,0,.5), transparent),
  radial-gradient(circle at 80% 70%, rgba(0,0,255,.5), transparent),
  #111;
```

## 10. Quick Reference Table

| Function | Direction Control | Repeats |
|----------|------------------|---------|
| `linear-gradient()` | angle / `to side` | No |
| `radial-gradient()` | shape, size, `at pos` | No |
| `conic-gradient()` | `from angle at pos` | No |
| `repeating-linear-gradient()` | angle / `to side` | Yes |
| `repeating-radial-gradient()` | shape, size, `at pos` | Yes |
| `repeating-conic-gradient()` | `from angle at pos` | Yes |

## Pro Tips

- **Prefixes**: `-webkit-` for `background-clip: text` and older Safari; gradients themselves are widely supported unprefixed.
- **Hard stops**: use two stops at the same position (`red 50%, blue 50%`).
- **Transparency fade**: `linear-gradient(to bottom, transparent, black)`.
- **Modern syntax**: use `in oklch` / `in oklab` for perceptually smooth blends.
- **Angle reminder**: `0deg` points **up**, angles increase **clockwise**.