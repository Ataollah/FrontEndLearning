# CSS Basic Selectors Cheatsheet

## Quick Reference Table

| Selector | Syntax | Example | Targets |
|----------|--------|---------|---------|
| Universal | `*` | `* { }` | Every element |
| Type | `element` | `p { }` | All `<p>` elements |
| Class | `.classname` | `.btn { }` | Elements with `class="btn"` |
| ID | `#idname` | `#header { }` | Element with `id="header"` |
| Grouping | `sel1, sel2` | `h1, h2 { }` | Both `h1` and `h2` |
| Chaining | `sel1sel2` | `p.intro { }` | `<p>` with `class="intro"` |

---

## 1. Universal Selector `*`

Selects **every** element on the page.

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
```

⚠️ Use sparingly — can hurt performance on large pages.

---

## 2. Type Selector (Element)

Selects all elements of a given tag name.

```css
p {
  line-height: 1.6;
}

h1 {
  font-size: 2rem;
}

a {
  text-decoration: none;
}
```

---

## 3. Class Selector `.`

Selects elements with a matching `class` attribute. **Reusable.**

```html
<p class="highlight">Hello</p>
<span class="highlight">World</span>
```

```css
.highlight {
  background: yellow;
}
```

Multiple classes on one element:
```html
<div class="card shadow rounded"></div>
```

---

## 4. ID Selector `#`

Selects the element with a matching `id`. **Must be unique per page.**

```html
<nav id="main-nav"></nav>
```

```css
#main-nav {
  position: sticky;
  top: 0;
}
```

⚠️ Higher specificity than classes — avoid overusing.

---

## 5. Grouping Selectors `,`

Apply the same styles to multiple selectors.

```css
h1, h2, h3 {
  font-family: 'Georgia', serif;
  color: #333;
}

.btn, .link, .badge {
  border-radius: 4px;
}
```

Equivalent to writing separate rules — saves repetition.

---

## 6. Chaining Selectors

Combine selectors (no space) to target elements matching **all** conditions.

```css
/* <p> that ALSO has class "intro" */
p.intro {
  font-weight: bold;
}

/* <a> with class "btn" AND "primary" */
a.btn.primary {
  background: blue;
}

/* <button> with id "submit" AND class "disabled" */
button#submit.disabled {
  opacity: 0.5;
}
```

**Key rule:** No space = AND. Space = descendant.

```css
p.intro { }   /* <p class="intro"> — same element */
p .intro { }  /* <p> containing .intro — different elements */
```

---

## Specificity Cheat (low → high)

```
*         → 0,0,0,0
element   → 0,0,0,1
.class    → 0,0,1,0
#id       → 0,1,0,0
inline    → 1,0,0,0
```

---

## Common Combos

```css
/* Reset then style */
* { box-sizing: border-box; }

/* Grouped headings */
h1, h2, h3, h4 { margin-bottom: 1rem; }

/* Chained button variants */
button.btn.primary { background: #007bff; }
button.btn.danger  { background: #dc3545; }

/* ID + class */
#hero.featured { min-height: 100vh; }
```