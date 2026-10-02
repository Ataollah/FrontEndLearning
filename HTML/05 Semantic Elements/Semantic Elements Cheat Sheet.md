# Semantic Elements Cheat Sheet
## SEO & Accessibility Focus

---

## 📌 Quick Reference Table

| Element | Purpose | SEO Impact | Accessibility Role |
|---------|---------|------------|-------------------|
| `<header>` | Intro content, logo, nav | Signals page/section intro | `banner` landmark |
| `<nav>` | Navigation links | Helps crawlers find structure | `navigation` landmark |
| `<main>` | Primary content (unique per page) | Emphasizes main content | `main` landmark |
| `<section>` | Thematic grouping | Adds topical structure | `region` (if labeled) |
| `<article>` | Self-contained content | Strong for content indexing | `article` landmark |
| `<aside>` | Tangential content | Marks supplementary info | `complementary` landmark |
| `<footer>` | Closing info, contact, copyright | Footer link context | `contentinfo` landmark |

---

## 🏗️ Typical Page Layout

```html
<body>
  <header>
    <h1>Site Name</h1>
    <nav aria-label="Main">...</nav>
  </header>

  <main>
    <article>
      <h2>Blog Post</h2>
      <section aria-labelledby="intro">
        <h3 id="intro">Introduction</h3>
        <p>...</p>
      </section>
      <aside aria-label="Related links">...</aside>
    </article>
  </main>

  <footer>
    <p>&copy; 2025</p>
  </footer>
</body>
```

---

## 🔍 SEO Best Practices

- **One `<h1>` per page** — usually inside `<header>` or `<main>`
- **One `<main>` per page** — content unique to that URL
- **Use `<article>`** for blog posts, news, product cards → better rich results
- **Use `<section>` with headings** — search engines parse heading hierarchy
- **Descriptive `<nav>`** helps internal link equity flow
- **`<aside>`** should relate to adjacent content (not random ads)
- **`<footer>`** links get less weight — don't hide key nav there
- **Don't rely on `<div>` soup** — semantic tags improve crawlability

---

## ♿ Accessibility Best Practices

### Landmarks (Screen Reader Navigation)
- `<header>` → **banner** (top-level only)
- `<nav>` → **navigation**
- `<main>` → **main** (skip-link target)
- `<aside>` → **complementary**
- `<footer>` → **contentinfo** (top-level only)

### Labeling Rules
```html
<!-- Multiple navs need labels -->
<nav aria-label="Main">...</nav>
<nav aria-label="Breadcrumb">...</nav>

<!-- Sections need accessible names -->
<section aria-labelledby="reviews-heading">
  <h2 id="reviews-heading">Reviews</h2>
</section>
```

### Nested Element Rules
- **`<header>` / `<footer>` inside `<article>` or `<section>`** = NOT landmarks (scoped)
- **`<main>` must NOT be nested** inside article/section/aside
- **Only one visible `<main>`** per page

---

## ⚠️ Common Mistakes

| ❌ Don't | ✅ Do |
|---------|------|
| Multiple `<main>` tags | One `<main>` per page |
| `<header>` inside every `<div>` | Reserve for page/section intros |
| `<section>` without heading | Add `<h2>`–`<h6>` or `aria-label` |
| `<article>` for everything | Only self-contained content |
| `<nav>` for non-navigation links | Use `<ul>` or plain links |
| Empty `<aside>` for ads | Use `<div>` if not complementary |

---

## 🎯 Decision Flowchart

```
Is it the top intro area?           → <header>
Is it a group of nav links?         → <nav>
Is it the primary unique content?   → <main>
Is it self-contained (reusable)?    → <article>
Is it a themed subsection?          → <section>
Is it tangential/supplementary?     → <aside>
Is it closing info (author, ©)?     → <footer>
```

---

## 🧪 Testing Tools

- **axe DevTools** — browser extension for a11y
- **Lighthouse** — Chrome DevTools → SEO + Accessibility
- **WAVE** — visual a11y feedback
- **NVDA / VoiceOver** — test landmark navigation
- **Google Rich Results Test** — structured content

---

## 💡 Pro Tips

1. **Skip link** target = `<main id="main">`
2. **Heading order matters** — don't jump h2 → h4
3. **`<article>` + schema.org** = rich snippets
4. **Combine semantics with ARIA** only when HTML falls short
5. **Test with keyboard only** (Tab + Enter) to verify landmarks
6. **`<section>` ≠ `<div>`** — use `<div>` for pure styling wrappers