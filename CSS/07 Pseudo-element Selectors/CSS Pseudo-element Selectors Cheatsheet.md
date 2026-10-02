# CSS Pseudo-element Selectors Cheatsheet

## `::before` and `::after` — Creating Content with CSS

Insert generated content before/after an element's actual content. **Requires the `content` property** to render.

```css
.box::before {
  content: "→ ";
  color: blue;
}

.box::after {
  content: "";
  display: block;
  clear: both;
}
```

**Common uses:**
- Decorative icons, tooltips, clearfix
- `content: attr(data-label)` — pull text from HTML attributes
- `content: ""` with `display: block/inline-block` to create shapes (e.g., triangles, overlays)

**Key points:**
- Not applied to replaced elements (`<img>`, `<input>`, `<br>`)
- Inherits styles from the parent
- Position with `position: absolute` relative to a positioned parent

---

## `::first-line` and `::first-letter`

Style just the first line or first letter of a block of text.

```css
p::first-line {
  font-weight: bold;
  text-transform: uppercase;
}

p::first-letter {
  font-size: 3em;
  float: left;
  margin-right: 8px;
  color: crimson;
}
```

**Key points:**
- Only work on **block-level** elements
- `::first-line` accepts a limited set of properties (font, color, background, word/letter-spacing, text-decoration, etc.)
- `::first-letter` is great for drop caps; ignores inline images/punctuation rules (browsers vary slightly)

---

## `::selection`

Styles the portion of text highlighted by the user.

```css
::selection {
  background: #ffcc00;
  color: #000;
}

.highlight::selection {
  background: hotpink;
  color: white;
}
```

**Key points:**
- Only a few properties work: `color`, `background-color`, `text-shadow`, `text-decoration`, `-webkit-text-stroke`
- Use without an element to style globally, or scoped to a selector

---

## `::marker` — List Styling

Styles the bullet/number of list items.

```css
li::marker {
  color: teal;
  font-weight: bold;
  font-size: 1.2em;
}

li::marker {
  content: "✔ ";
}
```

**Key points:**
- Applies to `<li>` and `<summary>` elements
- Works with `list-style-type` (disc, decimal, etc.)
- Allowed properties: `color`, `font-*`, `content`, `text-*`, `white-space`, `animation`, `transition`

---

## `::placeholder` — Styling Input Placeholders

Styles the placeholder text inside form inputs.

```css
input::placeholder {
  color: #999;
  font-style: italic;
  opacity: 1; /* Firefox reduces opacity by default */
}

textarea::placeholder {
  color: lightgray;
}
```

**Key points:**
- Applies to `<input>`, `<textarea>`, and contenteditable elements
- Always set `opacity: 1` for Firefox consistency
- Limited properties: mostly color, font, text properties
- Not to be confused with `:placeholder-shown` (a pseudo-**class**)

---

## Quick Reference Table

| Pseudo-element | Purpose | Needs `content`? |
|----------------|---------|------------------|
| `::before` | Insert content before element | ✅ Yes |
| `::after` | Insert content after element | ✅ Yes |
| `::first-line` | Style first line of text | ❌ |
| `::first-letter` | Style first letter | ❌ |
| `::selection` | Style user-selected text | ❌ |
| `::marker` | Style list bullets/numbers | Optional (for custom) |
| `::placeholder` | Style input placeholder text | ❌ |

---

## Syntax Note

- **Double colon (`::`)** is the modern standard (CSS3)
- Single colon (`:before`, `:after`) still works for legacy support
- Pseudo-elements can be chained: `p::first-line::selection` (limited support)

## Bonus: Combining with pseudo-classes

```css
/* Style marker only on hover */
li:hover::marker {
  color: red;
}

/* Placeholder color when input is focused */
input:focus::placeholder {
  color: transparent;
}
```