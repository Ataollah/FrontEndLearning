# CSS Specificity Cheatsheet

## How Specificity Works

When multiple rules target the same element, the browser picks the **most specific** one. Specificity is a weight calculated per selector.

**Priority order (highest → lowest):**

| Rank | Type | Example |
|------|------|---------|
| 1 | Inline styles | `style="color: red"` |
| 2 | ID selectors | `#header` |
| 3 | Classes, attributes, pseudo-classes | `.btn`, `[type="text"]`, `:hover` |
| 4 | Elements, pseudo-elements | `div`, `p`, `::before` |
| 5 | Universal / combinators | `*`, `>`, `+`, `~` (add nothing) |

> `!important` overrides everything except another `!important` (then specificity applies).

---

## Calculating Specificity `(0,0,0,0)`

Four slots: **(inline, IDs, classes/attrs/pseudo-classes, elements/pseudo-elements)**

| Selector | Specificity |
|----------|-------------|
| `*` | `0,0,0,0` |
| `li` | `0,0,0,1` |
| `ul li` | `0,0,0,2` |
| `ul ol li` | `0,0,0,3` |
| `.active` | `0,0,1,0` |
| `li.active` | `0,0,1,1` |
| `[href]` | `0,0,1,0` |
| `:hover` | `0,0,1,0` |
| `::before` | `0,0,0,1` |
| `#nav` | `0,1,0,0` |
| `#nav .active` | `0,1,1,0` |
| `#nav li.active` | `0,1,1,1` |
| `style="..."` | `1,0,0,0` |

**Rules for counting:**
- Compare left to right — first differing number wins.
- `(0,1,0,0)` beats `(0,0,99,99)` — a single ID beats any number of classes/elements.
- `:not()`, `:is()`, `:has()` — specificity = the most specific argument inside (the pseudo-class itself adds 0).
- `:where()` — always adds **0** specificity.
- Combinators (`>`, `+`, `~`, ` `) add nothing.

**Example comparison:**
```css
a.link.big        /* 0,0,2,1 */
nav a.link        /* 0,0,1,2 */  ← loses
#main a           /* 0,1,0,1 */  ← wins
```

---

## When to Use `!important` (and Why to Avoid It)

**What it does:** Overrides normal declarations, ignoring specificity (unless another `!important` competes — then normal specificity rules apply).

**Legitimate uses:**
- Overriding third-party library / CMS styles you can't edit.
- Utility classes (e.g., `.hidden { display: none !important; }`).
- Accessibility overrides (e.g., forced high-contrast, `prefers-reduced-motion`).
- Quick debugging (remove before shipping).

**Why to avoid it:**
- Breaks the natural cascade — future overrides need `!important` too (arms race).
- Hard to debug; source order becomes confusing.
- Masks poor selector architecture.
- Makes refactoring and theming fragile.

**Prefer instead:** lower specificity, source order, cascade layers (`@layer`), or better-structured selectors.

---

## Specificity and Inheritance

**Key idea:** Specificity only applies to rules that **directly match** an element. Inherited values are *not* "winning rules" — they just fill in when nothing matches.

- Inherited properties (e.g., `color`, `font-family`) flow from parent to child **only if the child has no matching declaration**.
- A direct rule always beats an inherited value, no matter how specific the parent's selector.

```css
#parent { color: red; }      /* specificity 0,1,0,0 */
p { color: blue; }           /* specificity 0,0,0,1 — still wins on <p> */
```
```html
<div id="parent"><p>blue</p></div>  <!-- p is blue -->
```

**Special keywords:**
- `inherit` — force a property to take the parent's computed value (explicitly, even for non-inherited props).
- `initial` — reset to the property's default value.
- `unset` — `inherit` for inherited props, `initial` for non-inherited.
- `revert` — roll back to the browser/user-agent stylesheet value.

**Non-inherited properties** (e.g., `margin`, `padding`, `border`, `background`) must be set on each element or via `inherit`.

---

## Quick Mental Model

1. Inline beats IDs beats classes beats elements.
2. Count `(inline, ID, class, element)` and compare left to right.
3. `!important` skips the queue — use sparingly.
4. Inheritance only kicks in when **nothing matches** — it never competes on specificity.

**Pro tip:** Keep specificity **low and flat** (mostly single classes). It makes overrides predictable and eliminates the need for `!important`.