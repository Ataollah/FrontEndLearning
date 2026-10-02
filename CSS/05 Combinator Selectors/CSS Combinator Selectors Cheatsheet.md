# CSS Combinator Selectors Cheatsheet

## Quick Reference

| Combinator | Symbol | Name | Selects |
|------------|--------|------|---------|
| Descendant | ` ` (space) | Descendant | All matching elements **anywhere inside** ancestor |
| Child | `>` | Child | Only **direct children** of parent |
| Adjacent Sibling | `+` | Next sibling | The **immediately following** sibling |
| General Sibling | `~` | Subsequent sibling | **All following** siblings |

---

## 1. Descendant Selector (space)

Selects **any** matching element nested inside another, at **any depth**.

```css
div p {
  color: blue;
}
```

```html
<div>
  <p>Styled ✓</p>          <!-- direct child, matched -->
  <section>
    <p>Styled ✓</p>        <!-- deep nested, matched -->
  </section>
</div>
<p>Not styled ✗</p>        <!-- outside, not matched -->
```

**Use case:** Broad styling of elements within a container.

---

## 2. Child Selector (`>`)

Selects only **direct children** (one level down).

```css
div > p {
  color: red;
}
```

```html
<div>
  <p>Styled ✓</p>          <!-- direct child -->
  <section>
    <p>Not styled ✗</p>    <!-- grandchild, skipped -->
  </section>
</div>
```

**Use case:** Precise control without affecting deeper nesting.

---

## 3. Adjacent Sibling Selector (`+`)

Selects the **single element immediately after** another, sharing the same parent.

```css
h1 + p {
  margin-top: 0;
}
```

```html
<h1>Title</h1>
<p>Styled ✓</p>            <!-- right after h1 -->
<p>Not styled ✗</p>        <!-- second p, skipped -->
```

**Use case:** Styling a heading's subtitle, first paragraph after a title.

---

## 4. General Sibling Selector (`~`)

Selects **all following siblings** (not just the next one), sharing the same parent.

```css
h2 ~ p {
  color: green;
}
```

```html
<h2>Heading</h2>
<p>Styled ✓</p>            <!-- all following p's -->
<p>Styled ✓</p>
<div>Not a p ✗</div>
<p>Styled ✓</p>
```

**Use case:** Styling all paragraphs that follow a heading.

---

## Visual Comparison

```
<div>
  <p>A</p>          ← div p ✓ | div > p ✓
  <section>
    <p>B</p>        ← div p ✓ | div > p ✗
  </section>
</div>

<h1>H</h1>
<p>C</p>            ← h1 + p ✓ | h1 ~ p ✓
<p>D</p>            ← h1 + p ✗ | h1 ~ p ✓
```

---

## Common Gotchas

- **`+` and `~` require same parent** — siblings only, not cousins.
- **`+` matches exactly one element** — only the very next sibling.
- **`~` matches all following**, regardless of how many elements are between them.
- **`>` is stricter than space** — use it to avoid styling deeply nested elements unintentionally.
- **Order matters for `+`/`~`** — the selector on the right must come *after* the one on the left in the DOM.
- **Combinators can chain:** `div > ul li + li` is valid.

---

## Combining Example

```css
/* All <a> inside nav, but only direct <li> children,
   that immediately follow another <li> */
nav > ul > li + li > a {
  border-left: 1px solid gray;
}
```

**Tip:** When in doubt, start with the descendant selector (` `) and narrow down with `>` for precision.