# HTML Forms Comprehensive Cheatsheet

## 1. Form Tag Basics

```html
<form action="/submit" method="POST" enctype="multipart/form-data">
  <!-- form elements -->
</form>
```

### Key Attributes
| Attribute | Purpose | Values |
|-----------|---------|--------|
| `action` | Where to send data | URL |
| `method` | HTTP method | `GET` (default) / `POST` |
| `enctype` | Encoding type | `application/x-www-form-urlencoded` (default), `multipart/form-data` (files), `text/plain` |
| `target` | Where to open response | `_self`, `_blank`, `_parent`, `_top` |
| `novalidate` | Skip HTML validation | boolean |
| `autocomplete` | Browser autofill | `on` / `off` |

### GET vs POST
| GET | POST |
|-----|------|
| Data in URL query string | Data in request body |
| Visible, bookmarkable | Hidden from URL |
| Limited length (~2048 chars) | No practical limit |
| Cached, in browser history | Not cached |
| Use for search/filter | Use for login, mutations, files |

---

## 2. Input Types

```html
<input type="text" name="username">
<input type="password" name="pwd">
<input type="email" name="email">
<input type="number" name="age" min="0" max="120" step="1">
<input type="tel" name="phone">
<input type="url" name="site">
<input type="date" name="dob">
<input type="time" name="alarm">
<input type="datetime-local" name="meeting">
<input type="month" name="billing">
<input type="week" name="week">
<input type="color" name="theme" value="#ff0000">
<input type="range" name="volume" min="0" max="100" step="10">
<input type="file" name="avatar" accept="image/*" multiple>
<input type="hidden" name="userId" value="123">
<input type="submit" value="Send">
<input type="reset" value="Clear">
<input type="button" value="Click" onclick="doSomething()">
<input type="checkbox" name="agree">
<input type="radio" name="gender" value="male">
<input type="search" name="q">
```

### Type Cheat Table
| Type | Purpose | Extra Attributes |
|------|---------|------------------|
| `text` | Single-line text | `pattern`, `maxlength` |
| `password` | Masked input | — |
| `email` | Email validation | `multiple` |
| `number` | Numeric | `min`, `max`, `step` |
| `tel` | Phone | `pattern` |
| `url` | URL validation | — |
| `date/time/datetime-local/month/week` | Date pickers | `min`, `max`, `step` |
| `color` | Color picker | — |
| `range` | Slider | `min`, `max`, `step` |
| `file` | File upload | `accept`, `multiple`, `capture` |
| `hidden` | Invisible data | — |
| `submit/reset/button` | Actions | — |
| `checkbox` | Multi-select toggle | `checked` |
| `radio` | Single-select (group by `name`) | `checked` |
| `search` | Search field | — |

---

## 3. Textarea

```html
<textarea name="bio" rows="5" cols="40" maxlength="500" 
          placeholder="Tell us about yourself..." 
          wrap="soft" required></textarea>
```
- No `value` attribute — content goes between tags.
- `wrap`: `soft` (default) | `hard` (requires `cols`).
- Auto-resize via CSS: `resize: vertical;`

---

## 4. Select & Option (Dropdown)

```html
<select name="country" id="country" required>
  <option value="">-- Choose --</option>
  <optgroup label="Europe">
    <option value="fr">France</option>
    <option value="de" selected>Germany</option>
  </optgroup>
  <option value="us" disabled>USA (unavailable)</option>
</select>

<!-- Multiple selection -->
<select name="skills" multiple size="4">
  <option value="js">JavaScript</option>
  <option value="py">Python</option>
</select>
```

**Attributes:** `multiple`, `size`, `required`, `selected`, `disabled`, `optgroup label`.

---

## 5. Checkbox & Radio Buttons

```html
<!-- Checkbox (independent) -->
<label>
  <input type="checkbox" name="hobbies" value="reading" checked> Reading
</label>
<label>
  <input type="checkbox" name="hobbies" value="gaming"> Gaming
</label>

<!-- Radio group (same name = mutually exclusive) -->
<fieldset>
  <legend>Gender</legend>
  <label><input type="radio" name="gender" value="m" required> Male</label>
  <label><input type="radio" name="gender" value="f"> Female</label>
  <label><input type="radio" name="gender" value="x"> Other</label>
</fieldset>
```

⚠️ **Always give `value`** — otherwise submitted value is `"on"` (checkbox) or `"on"` (radio).

---

## 6. Label & Fieldset

```html
<!-- Label: two ways -->
<label for="email">Email</label>
<input id="email" type="email" name="email">

<label>Email <input type="email" name="email"></label> <!-- implicit -->

<!-- Fieldset groups related fields -->
<fieldset>
  <legend>Shipping Address</legend>
  <label>Street <input name="street"></label>
  <label>City <input name="city"></label>
</fieldset>
```

**Why:** Accessibility (screen readers), larger click targets, semantic grouping.

---

## 7. Datalist (Autocomplete)

```html
<label for="browser">Browser:</label>
<input list="browsers" id="browser" name="browser">
<datalist id="browsers">
  <option value="Chrome">
  <option value="Firefox">
  <option value="Safari">
  <option value="Edge">
</datalist>
```
- Suggests but allows free text (unlike `<select>`).
- Linked via `input[list]` = `datalist[id]`.

---

## 8. Form Validation (Built-in)

```html
<input type="text" name="user" required minlength="3" maxlength="20"
       pattern="[A-Za-z0-9_]+" title="Letters, numbers, underscore only">

<input type="number" name="age" min="18" max="99" step="1" required>

<input type="email" name="email" required>

<input type="file" name="doc" accept=".pdf,.docx" required>
```

| Attribute | Applies To | Effect |
|-----------|-----------|--------|
| `required` | Most inputs | Must be filled |
| `min` / `max` | number, date, range | Numeric/date range |
| `step` | number, range, date | Increment |
| `minlength` / `maxlength` | text, textarea | Character count |
| `pattern` | text-like | Regex (anchored) |
| `type` | all | Format check (email, url, number) |
| `title` | all | Tooltip shown on error |
| `novalidate` (form) | form | Disable all validation |

**CSS hooks:**
```css
input:valid   { border-color: green; }
input:invalid { border-color: red; }
input:required { border-left: 3px solid orange; }
input:focus:invalid { outline: 2px solid red; }
```

**JS API:**
```js
input.checkValidity();        // boolean
input.reportValidity();       // show browser message
input.setCustomValidity("msg"); // custom error
input.validity.valueMissing;  // detailed state
```

---

## 9. HTML5 Input Attributes

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `placeholder` | Hint text | `placeholder="you@mail.com"` |
| `autofocus` | Focus on page load | `autofocus` |
| `disabled` | Not editable, not submitted | `disabled` |
| `readonly` | Not editable, but submitted | `readonly` |
| `multiple` | Allow multiple values | file, email, select |
| `autocomplete` | Autofill hint | `autocomplete="email"` |
| `inputmode` | Virtual keyboard | `inputmode="numeric"` |
| `list` | Link to datalist | `list="ids"` |
| `form` | Associate with form by id | `form="myForm"` |
| `formaction` / `formmethod` | Override submit behavior | on submit buttons |

**`disabled` vs `readonly`**
| | disabled | readonly |
|-|----------|----------|
| Editable | ❌ | ❌ |
| Submitted | ❌ | ✅ |
| Focusable | ❌ | ✅ |
| Styled by `:disabled` | ✅ | No |

---

## 10. Form Submission & FormData

### Submission flow
1. User clicks `submit` (or presses Enter).
2. Browser runs validation (unless `novalidate`).
3. `submit` event fires (cancel with `e.preventDefault()`).
4. If not prevented → data is encoded and sent via `method` to `action`.

### FormData API

```js
const form = document.querySelector('#myForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Build from form element
  const fd = new FormData(form);

  // Read values
  fd.get('username');           // single value
  fd.getAll('hobbies');         // array (checkboxes/multi-select)
  fd.has('email');
  fd.set('username', 'new');    // overwrite
  fd.append('extra', 'value');  // add
  fd.delete('obsolete');

  // Iterate
  for (const [key, value] of fd.entries()) {
    console.log(key, value);
  }

  // Send via fetch (no Content-Type — browser sets boundary)
  const res = await fetch('/api/submit', {
    method: 'POST',
    body: fd
  });
  const json = await res.json();
});

// Build from scratch
const manual = new FormData();
manual.append('name', 'Jane');
manual.append('avatar', fileInput.files[0]);
```

### JSON alternative
```js
const data = Object.fromEntries(new FormData(form));
await fetch('/api', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```
> ⚠️ `Object.fromEntries` loses duplicate keys (checkboxes). Use `fd.getAll()` for those.

### File uploads
- Form needs `enctype="multipart/form-data"`.
- With `fetch` + `FormData`, **do not** set `Content-Type` manually — the browser adds the boundary.

---

## 11. Best Practices Checklist

- ✅ Always pair `<input>` with `<label>` (use `for`/`id` or wrap).
- ✅ Use `name` on every field — otherwise it's not submitted.
- ✅ Give `value` to checkboxes/radios.
- ✅ Group radios in `<fieldset>` with `<legend>`.
- ✅ Use `type="email"`, `type="tel"`, `type="number"` for mobile keyboards.
- ✅ Prefer `POST` for anything sensitive or mutating.
- ✅ Client-side validation is UX only — **always validate server-side**.
- ✅ Use `autocomplete` attributes (`email`, `new-password`, `cc-number`) for UX.
- ✅ Set `required` + `minlength` + `pattern` for robust validation.
- ✅ Use `novalidate` only when implementing custom validation in JS.
- ✅ Reset form state with `form.reset()` after successful submit if needed.

---

## 12. Quick Minimal Template

```html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Form</title></head>
<body>
<form id="signup" action="/signup" method="POST" enctype="multipart/form-data" novalidate>
  <fieldset>
    <legend>Account</legend>

    <label for="user">Username</label>
    <input id="user" name="user" type="text" required minlength="3" autocomplete="username">

    <label for="email">Email</label>
    <input id="email" name="email" type="email" required autocomplete="email">

    <label for="pwd">Password</label>
    <input id="pwd" name="pwd" type="password" required minlength="8" autocomplete="new-password">

    <label for="bday">Birthday</label>
    <input id="bday" name="bday" type="date" max="2025-01-01">

    <label for="bio">Bio</label>
    <textarea id="bio" name="bio" rows="4" maxlength="300"></textarea>

    <label for="country">Country</label>
    <select id="country" name="country" required>
      <option value="">Choose…</option>
      <option value="us">USA</option>
      <option value="fr">France</option>
    </select>

    <label for="lang">Favorite language</label>
    <input id="lang" name="lang" list="langs">
    <datalist id="langs">
      <option value="JavaScript"><option value="Python"><option value="Rust">
    </datalist>

    <label><input type="checkbox" name="tos" value="yes" required> Accept ToS</label>

    <label for="avatar">Avatar</label>
    <input id="avatar" name="avatar" type="file" accept="image/*">

    <button type="submit">Create account</button>
    <button type="reset">Reset</button>
  </fieldset>
</form>

<script>
document.getElementById('signup').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const res = await fetch('/signup', { method: 'POST', body: fd });
  console.log(await res.json());
});
</script>
</body>
</html>
```

---

**Golden rule:** HTML validation for UX, server validation for security. Always assume client input is hostile.