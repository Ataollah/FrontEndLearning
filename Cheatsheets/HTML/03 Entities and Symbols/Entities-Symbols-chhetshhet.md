# Entities & Symbols Cheatsheet

## 1. HTML Entities

HTML entities are used to display reserved characters or characters not easily typed on a keyboard. They start with `&` and end with `;`.

### Essential / Reserved Characters

| Character | Entity Name | Entity Number | Description |
|-----------|-------------|---------------|-------------|
| `<` | `&lt;` | `&#60;` | Less than |
| `>` | `&gt;` | `&#62;` | Greater than |
| `&` | `&amp;` | `&#38;` | Ampersand |
| `"` | `&quot;` | `&#34;` | Double quote |
| `'` | `&apos;` | `&#39;` | Single quote / apostrophe |

### Common Symbols

| Character | Entity Name | Entity Number | Description |
|-----------|-------------|---------------|-------------|
| `©` | `&copy;` | `&#169;` | Copyright |
| `®` | `&reg;` | `&#174;` | Registered trademark |
| `™` | `&trade;` | `&#8482;` | Trademark |
| `€` | `&euro;` | `&#8364;` | Euro |
| `£` | `&pound;` | `&#163;` | Pound |
| `¥` | `&yen;` | `&#165;` | Yen |
| `¢` | `&cent;` | `&#162;` | Cent |
| `§` | `&sect;` | `&#167;` | Section |
| `¶` | `&para;` | `&#182;` | Paragraph |
| `•` | `&bull;` | `&#8226;` | Bullet |
| `…` | `&hellip;` | `&#8230;` | Ellipsis |
| `–` | `&ndash;` | `&#8211;` | En dash |
| `—` | `&mdash;` | `&#8212;` | Em dash |
| `°` | `&deg;` | `&#176;` | Degree |
| `±` | `&plusmn;` | `&#177;` | Plus-minus |
| `×` | `&times;` | `&#215;` | Multiplication |
| `÷` | `&divide;` | `&#247;` | Division |
| `¼` | `&frac14;` | `&#188;` | One quarter |
| `½` | `&frac12;` | `&#189;` | One half |
| `¾` | `&frac34;` | `&#190;` | Three quarters |

### Arrows

| Character | Entity Name | Description |
|-----------|-------------|-------------|
| `←` | `&larr;` | Left arrow |
| `→` | `&rarr;` | Right arrow |
| `↑` | `&uarr;` | Up arrow |
| `↓` | `&darr;` | Down arrow |
| `↔` | `&harr;` | Left-right arrow |

### Math Symbols

| Character | Entity Name | Description |
|-----------|-------------|-------------|
| `√` | `&radic;` | Square root |
| `∞` | `&infin;` | Infinity |
| `∑` | `&sum;` | Summation |
| `∏` | `&prod;` | Product |
| `∫` | `&int;` | Integral |
| `≠` | `&ne;` | Not equal |
| `≤` | `&le;` | Less than or equal |
| `≥` | `&ge;` | Greater than or equal |
| `≈` | `&asymp;` | Approximately equal |
| `π` | `&pi;` | Pi |
| `µ` | `&micro;` | Micro |

### Greek Letters

| Character | Entity Name | Character | Entity Name |
|-----------|-------------|-----------|-------------|
| `α` | `&alpha;` | `Α` | `&Alpha;` |
| `β` | `&beta;` | `Β` | `&Beta;` |
| `γ` | `&gamma;` | `Γ` | `&Gamma;` |
| `δ` | `&delta;` | `Δ` | `&Delta;` |
| `ε` | `&epsilon;` | `Ε` | `&Epsilon;` |
| `θ` | `&theta;` | `Θ` | `&Theta;` |
| `λ` | `&lambda;` | `Λ` | `&Lambda;` |
| `µ` | `&mu;` | `Μ` | `&Mu;` |
| `π` | `&pi;` | `Π` | `&Pi;` |
| `σ` | `&sigma;` | `Σ` | `&Sigma;` |
| `φ` | `&phi;` | `Φ` | `&Phi;` |
| `ω` | `&omega;` | `Ω` | `&Omega;` |

### Currency Symbols

| Character | Entity Name | Description |
|-----------|-------------|-------------|
| `$` | `&dollar;` | Dollar |
| `€` | `&euro;` | Euro |
| `£` | `&pound;` | Pound |
| `¥` | `&yen;` | Yen |
| `¢` | `&cent;` | Cent |
| `₹` | `&#8377;` | Indian Rupee |
| `₿` | `&#8383;` | Bitcoin |

### Quotation & Punctuation

| Character | Entity Name | Description |
|-----------|-------------|-------------|
| `"` | `&ldquo;` | Left double quote |
| `"` | `&rdquo;` | Right double quote |
| `'` | `&lsquo;` | Left single quote |
| `'` | `&rsquo;` | Right single quote |
| `«` | `&laquo;` | Left angle quote |
| `»` | `&raquo;` | Right angle quote |
| `†` | `&dagger;` | Dagger |
| `‡` | `&Dagger;` | Double dagger |

### Spacing & Formatting

| Character | Entity Name | Description |
|-----------|-------------|-------------|
| (space) | `&nbsp;` | Non-breaking space |
| (space) | `&ensp;` | En space |
| (space) | `&emsp;` | Em space |
| (space) | `&thinsp;` | Thin space |
| (space) | `&#8203;` | Zero-width space |
| (soft hyphen) | `&shy;` | Soft hyphen |

---

## 2. Non-breaking Space (`&nbsp;`) in HTML

### What it is
A **non-breaking space** (`&nbsp;` or `&#160;`) is a space character that:
- **Prevents automatic line wrapping** at that point
- **Collapses multiple spaces** — HTML normally collapses consecutive spaces into one; `&nbsp;` preserves each one
- Renders as a normal space visually

### Common Uses

**1. Preventing line breaks between words:**
```html
<p>Call us at 555&nbsp;123&nbsp;4567</p>
<!-- The phone number stays together on one line -->
```

**2. Creating multiple visible spaces:**
```html
<p>Name:&nbsp;&nbsp;&nbsp;John Doe</p>
<!-- Renders as: Name:   John Doe -->
```

**3. Keeping units with numbers:**
```html
<p>10&nbsp;kg&nbsp;of&nbsp;flour</p>
```

**4. Empty table cells (so borders show):**
```html
<td>&nbsp;</td>
```

### Comparison

| Input | HTML Rendering | Result |
|-------|---------------|--------|
| `Hello    World` | Collapsed | `Hello World` |
| `Hello&nbsp;&nbsp;&nbsp;&nbsp;World` | Preserved | `Hello    World` |

### Best Practices / Warnings

- ⚠️ **Don't use for layout** — use CSS (`margin`, `padding`, `text-align`) instead
- ⚠️ **Accessibility issue** — screen readers may read `&nbsp;` as "blank" or skip it; excessive use harms a11y
- ⚠️ **Don't use to indent paragraphs** — use `text-indent` in CSS
- ✅ **Do use** to prevent orphans/widows, keep numbers with units, or preserve a specific space
- ✅ **Prefer CSS** `white-space: nowrap;` for preventing wraps when possible

### CSS Alternatives
```css
/* Prevent wrapping */
.no-wrap { white-space: nowrap; }

/* Preserve spaces */
.pre-formatted { white-space: pre; }

/* Indent paragraphs */
p { text-indent: 2em; }
```

---

## 3. Emoji & Special Characters

### Native Emoji (Direct Unicode)
Just paste them directly into HTML:
```html
<p>Hello 👋 World 🌍</p>
<p>I ❤️ coding 🚀</p>
```

### Emoji via HTML Entities (Decimal / Hex)

| Emoji | Decimal | Hex | Description |
|-------|---------|-----|-------------|
| 😀 | `&#128512;` | `&#x1F600;` | Grinning face |
| 😂 | `&#128514;` | `&#x1F602;` | Face with tears of joy |
| ❤️ | `&#10084;&#65039;` | `&#x2764;&#xFE0F;` | Red heart |
| 👍 | `&#128077;` | `&#x1F44D;` | Thumbs up |
| 🎉 | `&#127881;` | `&#x1F389;` | Party popper |
| 🔥 | `&#128293;` | `&#x1F525;` | Fire |
| ⭐ | `&#11088;` | `&#x2B50;` | Star |
| ✅ | `&#9989;` | `&#x2705;` | Check mark |
| ❌ | `&#10060;` | `&#x274C;` | Cross mark |
| ⚠️ | `&#9888;&#65039;` | `&#x26A0;&#xFE0F;` | Warning |
| 🚀 | `&#128640;` | `&#x1F680;` | Rocket |
| 💡 | `&#128161;` | `&#x1F4A1;` | Light bulb |

### Special Typography Characters

| Character | Entity | Name |
|-----------|--------|------|
| ✓ | `&#10003;` | Check mark |
| ✔ | `&#10004;` | Heavy check |
| ✗ | `&#10007;` | Ballot X |
| ✘ | `&#10008;` | Heavy ballot X |
| ★ | `&#9733;` | Black star |
| ☆ | `&#9734;` | White star |
| ♥ | `&#9829;` | Heart suit |
| ♦ | `&#9830;` | Diamond suit |
| ♣ | `&#9827;` | Club suit |
| ♠ | `&#9824;` | Spade suit |
| ☺ | `&#9786;` | Smiling face |
| ☹ | `&#9785;` | Frowning face |
| ☀ | `&#9728;` | Sun |
| ☁ | `&#9729;` | Cloud |
| ☂ | `&#9730;` | Umbrella |
| ♻ | `&#9851;` | Recycling |
| ⚡ | `&#9889;` | High voltage |
| ⌘ | `&#8984;` | Command key |
| ⌥ | `&#8997;` | Option key |
| ⇧ | `&#8679;` | Shift key |

### Using Emoji with CSS
```css
.icon::before {
  content: "✅ ";
}
.heart::after {
  content: "\2764"; /* Unicode escape for ❤ */
}
```

### Emoji Best Practices
- ✅ Use UTF-8 charset: `<meta charset="UTF-8">`
- ✅ Prefer **native Unicode emoji** for readability over entities
- ✅ Use entities when you need consistent rendering or can't type the emoji
- ⚠️ Emoji rendering varies across OS/browser (Apple, Google, Microsoft designs differ)
- ⚠️ Add `aria-label` for screen reader clarity:
```html
<span role="img" aria-label="rocket">🚀</span>
```

---

## Quick Reference: Entity Format

```
&entityname;     →  &copy;   →  ©
&#decimal;       →  &#169;   →  ©
&#xhex;          →  &#xA9;   →  ©
```

## Quick Tips
1. Always end entities with `;` — otherwise it may render literally
2. `&amp;` must be used for a literal `&` (e.g., `AT&amp;T`)
3. Use `&lt;` and `&gt;` when displaying HTML code as text
4. Set `<meta charset="UTF-8">` for full Unicode/emoji support
5. Validate entities at [W3C Markup Validator](https://validator.w3.org/)