# HTML & CSS Basics — Explained Separately

Below is a detailed breakdown of each topic from the cheat sheet, explained one by one with examples.

---

## 1. Elements, Tags, and Attributes

### 🔹 What is a Tag?
A **tag** is the markup keyword written inside angle brackets `< >`. It tells the browser what kind of content is coming.

```html
<p>   ← opening tag
</p>  ← closing tag
```

### 🔹 What is an Element?
An **element** is the complete package: **opening tag + content + closing tag**.

```html
<p>Hello World</p>
```
- `<p>` → opening tag
- `Hello World` → content
- `</p>` → closing tag

Some elements are **empty (void)** — they have no content and no closing tag:
```html
<br>
<hr>
<img src="photo.jpg">
```

### 🔹 What is an Attribute?
An **attribute** provides extra information about an element. It always goes **inside the opening tag** and follows the pattern `name="value"`.

```html
<a href="https://example.com" target="_blank">Visit</a>
```
- `href="https://example.com"` → attribute (where the link goes)
- `target="_blank"` → attribute (opens in a new tab)

### Common Attributes
| Attribute | Purpose |
|-----------|---------|
| `class`   | Reusable label for CSS/JS styling |
| `id`      | Unique identifier for one element |
| `src`     | Source URL (images, scripts) |
| `alt`     | Alternative text if image fails |
| `href`    | Link destination |
| `style`   | Inline CSS |

**Example combining all three:**
```html
<img src="cat.jpg" alt="A cute cat" class="pet-image">
```
Here `<img>` is a **tag**, the whole line is an **element**, and `src`, `alt`, `class` are **attributes**.

---

## 2. Headings (h1 – h6)

Headings define **titles and subtitles** on a page. HTML gives you 6 levels:

```html
<h1>Main Page Title</h1>       <!-- Largest, most important -->
<h2>Section Heading</h2>
<h3>Sub-section</h3>
<h4>Minor heading</h4>
<h5>Small heading</h5>
<h6>Smallest heading</h6>      <!-- Least important -->
```

### Key Points
- `<h1>` should appear **once per page** — it's the main title (great for SEO).
- Never skip levels (don't jump from `h1` to `h4`).
- Browsers apply **default sizes** — h1 is biggest, h6 is smallest.
- Headings carry **semantic meaning** (screen readers use them to navigate).

**Visual hierarchy:**
```
h1 → 2em (approx 32px)
h2 → 1.5em (24px)
h3 → 1.17em
h4 → 1em
h5 → 0.83em
h6 → 0.67em
```

---

## 3. Paragraphs and Line Breaks

### 🔹 `<p>` — Paragraph
Used for blocks of text. Adds automatic **space above and below**.

```html
<p>This is the first paragraph.</p>
<p>This is the second paragraph.</p>
```
The browser automatically puts margin between them.

### 🔹 `<br>` — Line Break
Forces a line break **inside** content. It's an **empty element** (no closing tag).

```html
<p>Roses are red,<br>Violets are blue.</p>
```
Renders as:
```
Roses are red,
Violets are blue.
```

### 🔹 When to use `<br>` vs `<p>`
| Use `<p>` | Use `<br>` |
|-----------|------------|
| Separate paragraphs of text | Line break inside a paragraph |
| Address blocks | Poetry / song lyrics |
| Any block of standalone text | Forcing a small break |

⚠️ **Don't** use `<br>` to add space between paragraphs — use CSS margins instead.

---

## 4. Horizontal Rules (`<hr>`)

The `<hr>` tag draws a **horizontal line** across the page. It represents a **thematic break** between content — like a scene change or topic shift.

```html
<p>End of section one.</p>
<hr>
<p>Start of section two.</p>
```

### Characteristics
- It's an **empty (void) element** — no closing tag.
- Renders as a thin line by default.
- You can style it with CSS:
```css
hr {
  border: none;
  border-top: 2px dashed #999;
  margin: 2rem 0;
}
```

### Semantic meaning
`<hr>` isn't just a visual divider — it tells the browser (and screen readers) that there's a **topic change**.

---

## 5. Comments in HTML

Comments are notes for yourself or other developers. They are **not rendered** by the browser.

### 🔹 HTML Comment Syntax
```html
<!-- This is an HTML comment -->
<p>Visible text</p>
<!-- 
  This is a multi-line comment.
  Useful for explaining complex markup.
-->
```

### Common Uses
- Explain what a section does
- Temporarily disable code:
```html
<!-- <p>This paragraph is hidden for now</p> -->
```
- Mark sections:
```html
<!-- ===== Header start ===== -->
<header>...</header>
<!-- ===== Header end ===== -->
```

⚠️ **Rules:**
- Cannot contain `--` inside.
- Never nest comments.
- Visible in the page source (so don't put secrets in them).

---

## 6. Comments in CSS

CSS uses a **different syntax** than HTML.

### 🔹 CSS Comment Syntax
```css
/* This is a single-line CSS comment */

/*
  This is a multi-line comment.
  It can span several lines.
*/

p {
  color: #333; /* inline comment next to a rule */
}
```

### Common Uses
- Organize stylesheets:
```css
/* ===== LAYOUT ===== */
/* ===== TYPOGRAPHY ===== */
/* ===== BUTTONS ===== */
```
- Explain tricky rules:
```css
margin: 0 auto; /* centers the container */
```
- Temporarily disable a rule:
```css
/* color: red; */
```

### ⚠️ Difference Between HTML & CSS Comments
| Feature | HTML | CSS |
|---------|------|-----|
| Syntax | `<!-- ... -->` | `/* ... */` |
| Works inside | Markup | Stylesheets / `<style>` |
| Can be inline | Yes | Yes |
| Cannot contain | `--` | `*/` |

**Important:** You **cannot** use HTML comments inside a `<style>` block, and you **cannot** use CSS comments in HTML body markup.

```html
<!-- ✅ correct -->
<style>
  /* ✅ correct CSS comment */
  p { color: red; }
</style>
```

---

## 📋 Quick Recap Table

| Concept | Syntax | Purpose |
|---------|--------|---------|
| Element | `<p>text</p>` | Full unit of content |
| Tag | `<p>` `</p>` | Markup keyword |
| Attribute | `src="pic.jpg"` | Extra info on element |
| Headings | `<h1>` … `<h6>` | Titles, hierarchy |
| Paragraph | `<p>...</p>` | Block of text |
| Line break | `<br>` | Break within a paragraph |
| Horizontal rule | `<hr>` | Thematic divider |
| HTML comment | `<!-- -->` | Notes in markup |
| CSS comment | `/* */` | Notes in stylesheets |

Would you like me to expand any one of these topics with more examples or edge cases?