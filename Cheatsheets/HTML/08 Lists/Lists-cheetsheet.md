# HTML Lists Cheatsheet

## 1. Unordered Lists (`<ul>`)

Creates a bulleted list. Each item uses `<li>`.

```html
<ul>
  <li>Apple</li>
  <li>Banana</li>
  <li>Cherry</li>
</ul>
```

**Common CSS `list-style-type` values:**
| Value | Appearance |
|-------|------------|
| `disc` | • (default) |
| `circle` | ○ |
| `square` | ■ |
| `none` | No marker |

```css
ul { list-style-type: square; }
```

---

## 2. Ordered Lists (`<ol>`) — Types & Start

Creates a numbered/lettered list.

```html
<ol>
  <li>First</li>
  <li>Second</li>
  <li>Third</li>
</ol>
```

### `type` Attribute
| Type | Marker |
|------|--------|
| `1` | 1, 2, 3 (default) |
| `A` | A, B, C |
| `a` | a, b, c |
| `I` | I, II, III |
| `i` | i, ii, iii |

```html
<ol type="A">
  <li>Alpha</li>
  <li>Beta</li>
</ol>
```

### `start` Attribute
Sets the starting number.

```html
<ol start="5">
  <li>Five</li>
  <li>Six</li>
</ol>
```

### `reversed` Attribute
Counts down instead of up.

```html
<ol reversed>
  <li>Three</li>
  <li>Two</li>
  <li>One</li>
</ol>
```

### `value` Attribute (on `<li>`)
Overrides numbering for a specific item.

```html
<ol>
  <li value="10">Ten</li>
  <li>Eleven</li>
</ol>
```

---

## 3. Definition Lists (`<dl>`, `<dt>`, `<dd>`)

Used for term–definition pairs (glossaries, FAQs, metadata).

- `<dl>` — definition list container
- `<dt>` — definition term
- `<dd>` — definition description

```html
<dl>
  <dt>HTML</dt>
  <dd>HyperText Markup Language</dd>

  <dt>CSS</dt>
  <dd>Language used to style web pages</dd>
</dl>
```

Multiple `<dd>` per `<dt>` are allowed:

```html
<dl>
  <dt>Coffee</dt>
  <dd>Black hot drink</dd>
  <dd>Also served iced</dd>
</dl>
```

---

## 4. Nested Lists

Place a full list inside an `<li>` of a parent list.

```html
<ul>
  <li>Fruits
    <ul>
      <li>Apple</li>
      <li>Banana</li>
    </ul>
  </li>
  <li>Vegetables
    <ol>
      <li>Carrot</li>
      <li>Broccoli</li>
    </ol>
  </li>
</ul>
```

> ✅ Always nest inside `<li>`, never directly inside `<ul>`/`<ol>`.

---

## 5. List Styling with CSS

### Marker Position
```css
ul {
  list-style-position: inside; /* or outside (default) */
}
```

### Shorthand
```css
ul {
  list-style: square inside url('bullet.png');
}
```

### Remove Markers
```css
ul { list-style: none; padding: 0; margin: 0; }
```

### Custom Markers with `::marker`
```css
li::marker {
  color: crimson;
  font-weight: bold;
  content: "→ ";
}
```

### Custom Bullets with `::before`
```css
ul {
  list-style: none;
  padding-left: 20px;
}
ul li::before {
  content: "★ ";
  color: gold;
  margin-right: 6px;
}
```

### Horizontal List (Nav Menu)
```css
ul.nav {
  list-style: none;
  display: flex;
  gap: 1rem;
}
```

### `list-style-image`
```css
ul {
  list-style-image: url('star.png');
}
```

---

## Quick Reference Table

| Tag | Purpose |
|-----|---------|
| `<ul>` | Unordered list |
| `<ol>` | Ordered list |
| `<li>` | List item |
| `<dl>` | Definition list |
| `<dt>` | Definition term |
| `<dd>` | Definition description |

| Attribute | Applies To | Purpose |
|-----------|-----------|---------|
| `type` | `<ol>` | Numbering style |
| `start` | `<ol>` | Starting value |
| `reversed` | `<ol>` | Descending order |
| `value` | `<li>` | Override single item |

| CSS Property | Purpose |
|--------------|---------|
| `list-style-type` | Marker shape |
| `list-style-position` | Marker inside/outside |
| `list-style-image` | Image as marker |
| `list-style` | Shorthand |
| `::marker` | Style the marker itself |