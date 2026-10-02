Here's a cheat sheet for HTML tables covering all the topics you mentioned:

# HTML Tables Cheat Sheet

## 1. Basic Table Structure

```html
<table>
  <tr>              <!-- table row -->
    <th>Header 1</th>   <!-- table header cell -->
    <th>Header 2</th>
  </tr>
  <tr>
    <td>Data 1</td>     <!-- table data cell -->
    <td>Data 2</td>
  </tr>
</table>
```

| Tag | Purpose |
|-----|---------|
| `<table>` | Container for the entire table |
| `<tr>` | Defines a **row** |
| `<th>` | Defines a **header cell** (bold + centered by default) |
| `<td>` | Defines a **data cell** |

---

## 2. Table Sections: thead, tbody, tfoot

```html
<table>
  <thead>              <!-- header section -->
    <tr>
      <th>Name</th>
      <th>Age</th>
    </tr>
  </thead>

  <tbody>              <!-- main body section -->
    <tr>
      <td>Alice</td>
      <td>25</td>
    </tr>
    <tr>
      <td>Bob</td>
      <td>30</td>
    </tr>
  </tbody>

  <tfoot>              <!-- footer section -->
    <tr>
      <td>Total</td>
      <td>55</td>
    </tr>
  </tfoot>
</table>
```

| Tag | Purpose |
|-----|---------|
| `<thead>` | Groups **header** rows |
| `<tbody>` | Groups **body** rows (main content) |
| `<tfoot>` | Groups **footer** rows (e.g., totals) |

> 💡 **Notes:**
> - A table can have multiple `<tbody>` elements.
> - `<tfoot>` must come **before** `<tbody>` in HTML source (in HTML5 it can be placed after too, but order renders differently).
> - Useful for styling and printing (header repeats on each printed page).

---

## 3. colspan and rowspan

### `colspan` — merge cells horizontally (across columns)

```html
<table>
  <tr>
    <th colspan="2">Full Name</th>   <!-- spans 2 columns -->
  </tr>
  <tr>
    <td>First</td>
    <td>Last</td>
  </tr>
</table>
```

### `rowspan` — merge cells vertically (across rows)

```html
<table>
  <tr>
    <td rowspan="2">Math</td>   <!-- spans 2 rows -->
    <td>Quiz 1</td>
  </tr>
  <tr>
    <td>Quiz 2</td>
  </tr>
</table>
```

### Combined Example

```html
<table border="1">
  <tr>
    <th rowspan="2">Subject</th>
    <th colspan="2">Scores</th>
  </tr>
  <tr>
    <th>Quiz</th>
    <th>Exam</th>
  </tr>
  <tr>
    <td>Math</td>
    <td>90</td>
    <td>85</td>
  </tr>
</table>
```

| Attribute | Description |
|-----------|-------------|
| `colspan="n"` | Cell spans **n columns** |
| `rowspan="n"` | Cell spans **n rows** |

---

## 4. Caption and Scope

### `<caption>` — table title/description

```html
<table>
  <caption>Student Grades - Fall 2024</caption>
  <tr>
    <th>Name</th>
    <th>Grade</th>
  </tr>
  <tr>
    <td>Alice</td>
    <td>A</td>
  </tr>
</table>
```

> 💡 Must be placed **immediately after** `<table>` (before `<thead>`/`<tr>`).  
> Renders above the table by default; can be moved with `caption-side` CSS.

### `scope` — accessibility for screen readers

```html
<table>
  <thead>
    <tr>
      <th scope="col">Name</th>     <!-- header for a column -->
      <th scope="col">Age</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Alice</th>    <!-- header for a row -->
      <td>25</td>
    </tr>
    <tr>
      <th scope="row">Bob</th>
      <td>30</td>
    </tr>
  </tbody>
</table>
```

| `scope` value | Meaning |
|---------------|---------|
| `col` | Header applies to the **column** below |
| `row` | Header applies to the **row** beside |
| `colgroup` | Header for a group of columns |
| `rowgroup` | Header for a group of rows |

---

## 5. Complete Example (All Features)

```html
<table border="1">
  <caption>Sales Report - Q1 2024</caption>

  <thead>
    <tr>
      <th scope="col">Product</th>
      <th scope="col">Region</th>
      <th scope="col">Sales</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <th scope="row" rowspan="2">Widget</th>
      <td>North</td>
      <td>$1,200</td>
    </tr>
    <tr>
      <td>South</td>
      <td>$900</td>
    </tr>
    <tr>
      <th scope="row">Gadget</th>
      <td colspan="2">Coming soon</td>
    </tr>
  </tbody>

  <tfoot>
    <tr>
      <td colspan="2">Total</td>
      <td>$2,100</td>
    </tr>
  </tfoot>
</table>
```

---

## 6. Quick Tips

- ✅ Always use `<th>` for headers, not styled `<td>`.
- ✅ Use `scope` for better accessibility.
- ✅ Use `<caption>` to describe the table.
- ✅ Use `<thead>`, `<tbody>`, `<tfoot>` for semantic structure.
- ✅ Avoid tables for **layout** — use them only for **tabular data**.
- ✅ Use CSS (`border-collapse: collapse`) for cleaner borders.

```css
table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
thead { background: #f4f4f4; }
```

That covers everything on your list! 🎯