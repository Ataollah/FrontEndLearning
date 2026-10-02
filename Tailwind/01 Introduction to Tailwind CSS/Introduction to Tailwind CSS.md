Tailwind CSS is a utility-first CSS framework that scans your HTML and JavaScript files for class names and generates a static CSS file containing only the styles you actually use . It works with modern build tools like Vite, PostCSS, and CLI, giving you flexibility in how you set it up.

### ⚡ Quick Setup with Vite (Recommended)

For new projects using Vite (including React, Vue, Svelte, etc.), the official Vite plugin is the fastest way to get started .

1.  **Create your project**: If you don't have one, create a new Vite project.
    ```bash
    npm create vite@latest my-project
    cd my-project
    ```

2.  **Install Tailwind CSS and the Vite plugin**:
    ```bash
    npm install tailwindcss @tailwindcss/vite
    ```

3.  **Configure the Vite plugin**: Add the Tailwind plugin to your `vite.config.ts` or `vite.config.js`.
    ```javascript
    // vite.config.ts
    import { defineConfig } from 'vite'
    import tailwindcss from '@tailwindcss/vite'

    export default defineConfig({
      plugins: [
        tailwindcss(),
      ],
    })
    ```

4.  **Import Tailwind CSS**: Add an `@import` to your main CSS file (e.g., `src/index.css`).
    ```css
    /* src/index.css */
    @import "tailwindcss";
    ```

5.  **Start your build process**:
    ```bash
    npm run dev
    ```

6.  **Start using Tailwind**: Add your CSS file to the `<head>` and use utility classes in your HTML or components.
    ```html
    <!doctype html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="/src/style.css" rel="stylesheet">
    </head>
    <body>
      <h1 class="text-3xl font-bold underline">
        Hello world!
      </h1>
    </body>
    </html>
    ```

### 🛠️ Alternative: Tailwind CLI

If you want a lightweight setup without a specific framework or just want to use plain HTML, the Tailwind CLI is a great choice .

1.  **Install Tailwind CSS**:
    ```bash
    npm install tailwindcss @tailwindcss/cli
    ```

2.  **Import Tailwind in your CSS**:
    ```css
    /* src/input.css */
    @import "tailwindcss";
    ```

3.  **Start the Tailwind CLI build process**: This command scans your source files and builds the CSS output. The `--watch` flag automatically rebuilds on changes.
    ```bash
    npx @tailwindcss/cli -i ./src/input.css -o ./src/output.css --watch
    ```

4.  **Add the compiled CSS to your HTML**:
    ```html
    <!doctype html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="./output.css" rel="stylesheet">
    </head>
    <body>
      <h1 class="text-3xl font-bold underline">
        Hello world!
      </h1>
    </body>
    </html>
    ```

### 🧩 Using PostCSS

If you're integrating with build tools like webpack, Rollup, or Parcel, installing Tailwind as a PostCSS plugin is the most seamless approach .

1.  **Install Tailwind CSS and peer dependencies**:
    ```bash
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init
    ```

2.  **Add Tailwind to your PostCSS configuration**:
    ```javascript
    // postcss.config.js
    module.exports = {
      plugins: {
        tailwindcss: {},
        autoprefixer: {},
      },
    }
    ```

3.  **Configure your template paths**: In `tailwind.config.js`, tell Tailwind where your content files are.
    ```javascript
    // tailwind.config.js
    /** @type {import('tailwindcss').Config} */
    module.exports = {
      content: ["./src/**/*.{html,js}"],
      theme: {
        extend: {},
      },
      plugins: [],
    }
    ```

4.  **Add the Tailwind directives to your CSS**:
    ```css
    /* main.css */
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    ```

5.  **Start your build process**:
    ```bash
    npm run dev
    ```

Once installed, you can start styling by adding utility classes directly to your HTML elements. For example, `text-3xl` sets the font size, `font-bold` makes it bold, and `underline` adds an underline .