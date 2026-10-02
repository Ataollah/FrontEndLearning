# 📸 HTML Images Cheat Sheet

## 1. Image Tag (`<img>`)

```html
<img src="photo.jpg" alt="Description">
```

- **Void element** — no closing tag needed
- Self-contained, replaces content inline

---

## 2. Core Attributes

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `src` | Path/URL to image | `src="images/cat.jpg"` |
| `alt` | Text if image fails/for screen readers | `alt="A sleeping cat"` |
| `width` | Width in pixels | `width="300"` |
| `height` | Height in pixels | `height="200"` |
| `loading` | Lazy load | `loading="lazy"` |
| `decoding` | Decode hint | `decoding="async"` |

```html
<img src="dog.jpg" alt="Golden retriever" width="400" height="300" loading="lazy">
```

> 💡 **Tip:** Always set `width` & `height` — prevents layout shift (CLS).

> ♿ **Alt rules:**
> - Decorative → `alt=""`
> - Informative → describe the content
> - Never start with "Image of..."

---

## 3. Image Formats

| Format | Best For | Transparency | Animation | Notes |
|--------|----------|--------------|-----------|-------|
| **JPEG** | Photos | ❌ | ❌ | Lossy, small size |
| **PNG** | Logos, graphics | ✅ | ❌ | Lossless, larger |
| **SVG** | Icons, logos | ✅ | ✅ | Vector, scalable, tiny |
| **WebP** | Modern replacement | ✅ | ✅ | ~30% smaller than JPEG/PNG |
| **AVIF** | Next-gen | ✅ | ✅ | Best compression, growing support |

```html
<!-- SVG inline -->
<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"/></svg>
```

> 💡 Use `<picture>` for format fallback (see below).

---

## 4. Responsive Images

### `srcset` + `sizes`

```html
<img
  src="img-800.jpg"
  srcset="img-400.jpg 400w,
          img-800.jpg 800w,
          img-1600.jpg 1600w"
  sizes="(max-width: 600px) 100vw,
         (max-width: 1200px) 50vw,
         800px"
  alt="Responsive example">
```

- **`srcset` with `w`** → browser picks best resolution
- **`sizes`** → tells browser rendered width
- **`x` descriptor** → for fixed-density (e.g., `2x` for retina)

```html
<img src="logo.png" srcset="logo@2x.png 2x" alt="Logo">
```

### `<picture>` — Art Direction / Format Fallback

```html
<picture>
  <source srcset="hero.avif" type="image/avif">
  <source srcset="hero.webp" type="image/webp">
  <source media="(max-width: 600px)" srcset="hero-mobile.jpg">
  <img src="hero.jpg" alt="Hero image">
</picture>
```

---

## 5. `<figure>` & `<figcaption>`

Semantic way to group an image with a caption.

```html
<figure>
  <img src="chart.png" alt="Sales growth chart">
  <figcaption>Fig 1. Q4 sales growth</figcaption>
</figure>
```

### Styling with CSS

```css
figure {
  margin: 0;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  display: inline-block;
}

figcaption {
  font-size: 0.875rem;
  color: #666;
  text-align: center;
  margin-top: 0.5rem;
  font-style: italic;
}

/* Responsive image inside figure */
figure img {
  max-width: 100%;
  height: auto;
  display: block;
}
```

---

## 6. Quick CSS Rules for Images

```css
/* Prevent overflow */
img {
  max-width: 100%;
  height: auto;
}

/* Aspect ratio box */
img {
  aspect-ratio: 16 / 9;
  object-fit: cover;   /* or contain */
}

/* Center image */
img.centered {
  display: block;
  margin: 0 auto;
}
```

---

## 7. Best Practices ✅

- ✅ Always include `alt`
- ✅ Set `width` + `height` (avoid layout shift)
- ✅ Use `loading="lazy"` for below-the-fold images
- ✅ Serve WebP/AVIF with `<picture>` fallback
- ✅ Compress images before uploading
- ✅ Use `srcset`/`sizes` for responsive delivery
- ❌ Don't scale images with HTML alone — use CSS
- ❌ Don't use images for text content

---

Want me to expand any section (e.g., `<picture>` deep dive, lazy loading, or image optimization tools)?