# Text Formatting Cheatsheet

## Bold, Italic, Underline, Strikethrough

| Format | HTML | Markdown | Output |
|--------|------|----------|--------|
| **Bold** | `<b>text</b>` | `**text**` or `__text__` | **text** |
| *Italic* | `<i>text</i>` | `*text*` or `_text_` | *text* |
| Underline | `<u>text</u>` | *(no native MD)* | <u>text</u> |
| ~~Strikethrough~~ | `<s>text</s>` or `<del>text</del>` | `~~text~~` | ~~text~~ |

**Combined examples:**
```html
<b><i>Bold Italic</i></b>
<u><b>Bold Underline</b></u>
<del><b>Bold Strike</b></del>
```

---

## Superscript and Subscript

| Format | HTML | Output |
|--------|------|--------|
| Superscript | `<sup>text</sup>` | x<sup>2</sup> |
| Subscript | `<sub>text</sub>` | H<sub>2</sub>O |

**Examples:**
```html
E = mc<sup>2</sup>
H<sub>2</sub>O
x<sup>2</sup> + y<sup>2</sup> = z<sup>2</sup>
```

> Markdown has no native syntax — use HTML tags inline.

---

## Strong and Emphasis (Semantic vs Presentation)

| Semantic (meaning) | Presentational (look) | Markdown |
|--------------------|----------------------|----------|
| `<strong>` → important | `<b>` → bold | `**text**` |
| `<em>` → stressed emphasis | `<i>` → italic | `*text*` |

**Key differences:**
- `<strong>` / `<em>` convey **meaning** → better for accessibility & SEO
- `<b>` / `<i>` convey **appearance only** → use for styling, not meaning
- Screen readers may change tone for `<strong>` and `<em>`

```html
<!-- Preferred (semantic) -->
<p>This is <strong>critical</strong> and <em>subtle</em>.</p>

<!-- Presentation only -->
<p>Product name: <b>Nike</b>, foreign word: <i>café</i></p>
```

**Markdown mapping:** `**bold**` → `<strong>`, `*italic*` → `<em>`

---

## Blockquote, Pre, Code

### Blockquote
```html
<blockquote cite="https://source.com">
  Quoted text goes here.
</blockquote>
```
Markdown:
```markdown
> Quoted text
>> Nested quote
```

### Pre (Preformatted Text)
Preserves whitespace and line breaks. Uses monospace font.
```html
<pre>
  Line 1
    Line 2 (indented)
  Line 3
</pre>
```

### Code (Inline)
```html
<p>Use <code>console.log()</code> to debug.</p>
```

### Code Block (Pre + Code)
```html
<pre><code>
function hello() {
  console.log("Hello");
}
</code></pre>
```

Markdown:
````markdown
Inline: `code`

Block:
```js
function hello() {
  console.log("Hello");
}
```
````

---

## Quick Reference Summary

| Purpose | HTML | Markdown |
|---------|------|----------|
| Bold (visual) | `<b>` | `**x**` |
| Bold (semantic) | `<strong>` | `**x**` |
| Italic (visual) | `<i>` | `*x*` |
| Italic (semantic) | `<em>` | `*x*` |
| Underline | `<u>` | — |
| Strike | `<s>` / `<del>` | `~~x~~` |
| Superscript | `<sup>` | — |
| Subscript | `<sub>` | — |
| Blockquote | `<blockquote>` | `> x` |
| Preformatted | `<pre>` | ` ``` ` |
| Inline code | `<code>` | `` `x` `` |

**Best practice:** Prefer `<strong>`/`<em>` for meaning, `<b>`/`<i>` only for pure styling.