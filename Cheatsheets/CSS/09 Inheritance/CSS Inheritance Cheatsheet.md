# CSS Inheritance Cheatsheet

## What Properties Are Inherited

### ✅ Inherited by Default (Text, Font, Color)
```css
/* Typography */
font-family, font-size, font-weight, font-style,
font-variant, font-stretch, line-height

/* Text */
color, text-align, text-indent, text-transform,
letter-spacing, word-spacing, white-space,
direction, text-shadow

/* Lists */
list-style, list-style-type, list-style-position,
list-style-image

/* Other */
visibility, cursor, quotes, orphans, widows
```

### ❌ NOT Inherited (Box Model & Layout)
```css
/* Box model */
margin, padding, border, width, height

/* Backgrounds */
background, background-color, background-image

/* Layout */
display, position, top/right/bottom/left,
float, clear, overflow, z-index

/* Effects */
box-shadow, opacity, transform, filter
```

---

## The Four Keywords

| Keyword | Behavior |
|---------|----------|
| `inherit` | Takes parent's computed value |
| `initial` | Resets to CSS spec default (e.g., `color: black`) |
| `unset` | If inherited property → `inherit`; else → `initial` |
| `revert` | Reverts to user-agent (browser) stylesheet value |

```css
.child {
  color: inherit;        /* copies parent color */
  border: initial;       /* resets to spec default (none) */
  font-size: unset;      /* inherited prop → inherits */
  margin: unset;         /* non-inherited → initial (0) */
  display: revert;       /* back to browser default */
}
```

**Global keyword shorthand:**
```css
* { all: unset; }        /* nuke all styles */
* { all: revert; }       /* back to browser defaults */
```

---

## The `inherit` Keyword in Practice

### Common Use Case: Buttons Don't Inherit Font
```css
/* ❌ Buttons use browser font, not parent's */
body { font-family: 'Inter', sans-serif; }
button { } /* shows Arial/system font */

/* ✅ Fix */
button {
  font: inherit;
  color: inherit;
}
```

### Forcing Inheritance on Non-Inherited Properties
```css
.parent { border: 2px solid teal; }
.child  { border: inherit; }   /* child gets teal 2px border */
```

### Form Elements Reset
```css
input, textarea, select, button {
  font: inherit;
  color: inherit;
  background: none;
}
```

---

## Inheritance vs Cascade

| Aspect | **Inheritance** | **Cascade** |
|--------|----------------|-------------|
| **Direction** | Parent → Child (down the DOM tree) | Multiple rules → One element |
| **Trigger** | Only for *inherited properties* or `inherit` keyword | Always — every element resolves conflicts |
| **Scope** | Ancestor/descendant relationship | Any matching selector on same element |
| **Purpose** | Propagate text styles naturally | Resolve competing declarations |

### Cascade Priority (high → low)
1. `!important` (user-agent)
2. `!important` (user)
3. `!important` (author)
4. Inline styles (`style=""`)
5. Author stylesheets (specificity, then order)
6. User stylesheets
7. User-agent styles

### Specificity Quick Ref
```
Inline         → 1,0,0,0
#id            → 0,1,0,0
.class / [attr] / :hover → 0,0,1,0
element / ::before       → 0,0,0,1
*                          → 0,0,0,0
```

### Combined Example
```css
body   { color: blue; }          /* inherited by <p> */
p      { color: red; }           /* cascade wins on <p> */
p span { color: inherit; }       /* span inherits red from <p> */
```

**Mental model:**
- **Cascade** decides *which declaration* applies to an element.
- **Inheritance** decides *what value flows down* when no declaration exists.

---

## Debugging Tips
```css
/* DevTools → Computed tab shows "Inherited from <selector>" */
/* Grayed values = inherited; struck-through = overridden by cascade */

/* Force inheritance chain */
.child { color: inherit !important; }
```

## Gotchas
- `line-height` is inherited **as a number/ratio** — good.
- `font-size` with `em` compounds down the tree — use `rem`.
- `background` is not inherited → use `background: inherit` explicitly.
- `all: unset` also nukes your own styles — use surgically.