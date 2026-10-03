# HTML Hyperlinks Cheatsheet

## 1. Anchor Tag (`<a>`)

The `<a>` (anchor) tag creates hyperlinks to other pages, files, locations, or resources.

```html
<a href="https://example.com">Visit Example</a>
```

**Key Attributes:**
| Attribute | Purpose |
|-----------|---------|
| `href` | Destination URL (required) |
| `target` | Where to open the link |
| `download` | Downloads the linked resource |
| `rel` | Relationship between pages |
| `title` | Tooltip text |
| `id` / `name` | Anchor target for internal links |

---

## 2. Absolute vs Relative URLs

### Absolute URL
Full path including protocol and domain.
```html
<a href="https://www.example.com/about.html">About</a>
<a href="https://www.example.com/images/logo.png">Logo</a>
```
✅ Always works · ❌ Breaks if domain changes

### Relative URL
Path relative to the current page.
```html
<a href="about.html">About</a>           <!-- Same folder -->
<a href="pages/contact.html">Contact</a> <!-- Subfolder -->
<a href="../index.html">Home</a>         <!-- Parent folder -->
<a href="/blog/post.html">Post</a>       <!-- From root -->
<a href="#section">Jump</a>              <!-- Same page -->
```
✅ Portable · ❌ Depends on file structure

### Root-Relative URL
```html
<a href="/products/item.html">Item</a>  <!-- Always from domain root -->
```

---

## 3. Opening Links in New Tab

```html
<a href="https://example.com" target="_blank">Open in New Tab</a>
```

**Best Practice — Add `rel` for security:**
```html
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  Safe New Tab Link
</a>
```

| `rel` value | Purpose |
|-------------|---------|
| `noopener` | Prevents new page from accessing `window.opener` |
| `noreferrer` | Hides referrer info + implies `noopener` |

**Target Values:**
| Value | Behavior |
|-------|----------|
| `_self` | Same tab (default) |
| `_blank` | New tab/window |
| `_parent` | Parent frame |
| `_top` | Full window body |

---

## 4. Internal Links (ID-based Navigation)

Jump to a specific section within the same page or another page.

**Define the target:**
```html
<h2 id="section-1">Section 1</h2>
<h2 id="section-2">Section 2</h2>
```

**Link to it:**
```html
<!-- Same page -->
<a href="#section-1">Go to Section 1</a>

<!-- Different page -->
<a href="page.html#section-2">Go to Section 2</a>

<!-- Top of page -->
<a href="#">Back to Top</a>
```

---

## 5. Email and Telephone Links

### Email (`mailto:`)
```html
<a href="mailto:someone@example.com">Email Us</a>

<!-- With subject -->
<a href="mailto:someone@example.com?subject=Hello">Email with Subject</a>

<!-- With subject + body -->
<a href="mailto:a@b.com?subject=Hi&body=Hello%20there">Full Email Link</a>

<!-- Multiple recipients -->
<a href="mailto:a@b.com,c@d.com">Email Multiple</a>

<!-- CC / BCC -->
<a href="mailto:a@b.com?cc=x@y.com&bcc=z@y.com">With CC/BCC</a>
```

### Telephone (`tel:`)
```html
<a href="tel:+15551234567">Call Us</a>
<a href="tel:+1-555-123-4567">Call (formatted)</a>
```
> 💡 Use international format (`+countrycode`) for mobile compatibility.

### SMS
```html
<a href="sms:+15551234567">Send Text</a>
<a href="sms:+15551234567?body=Hi">Text with Message</a>
```

---

## 6. Download Attribute

Forces the browser to download the linked file instead of navigating to it.

```html
<!-- Basic download -->
<a href="file.pdf" download>Download PDF</a>

<!-- Custom filename -->
<a href="report.pdf" download="Annual-Report-2024.pdf">Download Report</a>
```

**Notes:**
- Works only for **same-origin** files (cross-origin is ignored for security).
- Filename in `download` overrides the original.
- File type must be supported or served with proper `Content-Disposition`.

---

## 7. Link States (CSS Styling)

Links have **5 pseudo-class states** — must be declared in this order (**LVHA**):

```css
/* 1. Link — unvisited */
a:link {
  color: blue;
  text-decoration: none;
}

/* 2. Visited */
a:visited {
  color: purple;
}

/* 3. Hover */
a:hover {
  color: red;
  text-decoration: underline;
}

/* 4. Focus — keyboard navigation */
a:focus {
  outline: 2px solid orange;
}

/* 5. Active — being clicked */
a:active {
  color: green;
}
```

**Mnemonic: LoVe HAte** → **L**ink, **V**isited, **H**over, **A**ctive

**Full example:**
```css
a:link    { color: #0066cc; text-decoration: none; }
a:visited { color: #663399; }
a:hover   { color: #ff6600; text-decoration: underline; }
a:focus   { outline: 2px dashed #000; }
a:active  { color: #cc0000; }
```

**Accessibility tip:** Never rely on color alone — add `underline`, `font-weight`, or icons.

---

## Quick Reference Table

| Task | Syntax |
|------|--------|
| Basic link | `<a href="url">Text</a>` |
| New tab | `<a href="url" target="_blank" rel="noopener">` |
| Same-page jump | `<a href="#id">` |
| Email | `<a href="mailto:x@y.com">` |
| Phone | `<a href="tel:+1234567890">` |
| Download | `<a href="file.pdf" download>` |
| Tooltip | `<a href="url" title="Info">` |

---

## Best Practices ✅

- Use **descriptive link text** (avoid "click here")
- Always add `rel="noopener"` with `target="_blank"`
- Prefer **relative URLs** for internal links
- Ensure **keyboard accessibility** (visible `:focus` state)
- Use `title` sparingly (poor mobile support)
- Test `mailto:` and `tel:` on real devices