# 📦 CSS Box Model Cheatsheet

## The Box Model (Inside → Out)

```
┌─────────────────────────────────────────┐
│              MARGIN                     │  ← Space OUTSIDE the border
│  ┌───────────────────────────────────┐  │
│  │            BORDER                 │  │  ← The visible edge
│  │  ┌─────────────────────────────┐  │  │
│  │  │         PADDING             │  │  │  ← Space INSIDE the border
│  │  │  ┌───────────────────────┐  │  │  │
│  │  │  │       CONTENT         │  │  │  │  ← Text, images, etc.
│  │  │  └───────────────────────┘  │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 1️⃣ Content
The actual text, images, or child elements.

```css
.box {
  width: 300px;
  height: 200px;
}
```
> ⚠️ By default, `width`/`height` apply to **content only**.

---

## 2️⃣ Padding
Space **between content and border**. Background color extends here.

```css
.box {
  padding: 10px;                    /* all sides */
  padding: 10px 20px;               /* top/bottom | left/right */
  padding: 10px 20px 30px;          /* top | left/right | bottom */
  padding: 10px 20px 30px 40px;     /* top | right | bottom | left */

  /* Individual */
  padding-top: 10px;
  padding-right: 20px;
  padding-bottom: 30px;
  padding-left: 40px;
}
```

---

## 3️⃣ Border
The edge between padding and margin.

```css
.box {
  border: 2px solid black;          /* width | style | color */

  /* Styles: solid, dashed, dotted, double, groove, ridge, none */
}
```

**Longhand:**
```css
border-width: 2px;
border-style: solid;
border-color: black;

/* Or per side */
border-top: 1px dashed red;
border-right: 2px solid blue;
border-bottom: 1px dotted green;
border-left: 3px double orange;

/* Rounded corners */
border-radius: 8px;
border-radius: 10px 20px 30px 40px;  /* TL TR BR BL */
```

---

## 4️⃣ Margin
Space **outside the border**. Transparent, no background.

```css
.box {
  margin: 10px;
  margin: 10px 20px;
  margin: 10px 20px 30px;
  margin: 10px 20px 30px 40px;

  /* Auto-centering */
  margin: 0 auto;

  /* Individual */
  margin-top: 10px;
  margin-right: 20px;
  margin-bottom: 30px;
  margin-left: 40px;
}
```

**❌ Margin Collapse:** Vertical margins between adjacent elements collapse to the larger value.

---

## 🎯 box-sizing (Critical!)

```css
/* Default — width = content only */
box-sizing: content-box;
/* total width = width + padding + border */

/* ⭐ Recommended — width includes padding + border */
box-sizing: border-box;
```

```css
/* Global reset — best practice */
*, *::before, *::after {
  box-sizing: border-box;
}
```

**Example:**
```css
/* content-box: total = 300 + 40 + 10 = 350px */
.box { width: 300px; padding: 20px; border: 5px solid; }

/* border-box: total = 300px */
.box { width: 300px; padding: 20px; border: 5px solid; box-sizing: border-box; }
```

---

## 📐 Total Size Formulas

| box-sizing     | Total Width                              |
|----------------|------------------------------------------|
| `content-box`  | `width + padding-L + padding-R + border-L + border-R` |
| `border-box`   | `width` (padding/border included)        |

Margins are **never** included in element size — they're outside.

---

## 🛠️ Debugging / Tools

```css
/* Visualize the box model */
* { outline: 1px solid red; }

/* DevTools: Chrome/Firefox → Inspect → "Computed" tab shows box diagram */
```

```javascript
// Read computed box values in JS
const el = document.querySelector('.box');
const cs = getComputedStyle(el);
console.log(cs.width, cs.padding, cs.border, cs.margin);
```

---

## ⚡ Quick Tips

- 🎨 **Padding** pushes content inward; **margin** pushes siblings away.
- 🖼️ Background applies to **content + padding + border** (not margin).
- 🔄 Use `box-sizing: border-box` on everything — avoids math headaches.
- 🚫 **Negative margins** are allowed; negative padding is not.
- 📏 **`margin: 0 auto`** centers block elements horizontally.
- 🕳️ Margins can **collapse vertically**; padding cannot.
- 🌊 Use `overflow` to control content spilling out of padding box.