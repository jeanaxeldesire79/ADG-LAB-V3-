# axeldev-portfolio

## Tailwind CSS production build (scaffolded)

The site currently uses the Tailwind CDN for convenience. For production, build a purged/minified CSS bundle to reduce CSS size and avoid any flash of unstyled content.

Scaffolded files:
- `tailwind.config.js` – content globs and theme extensions
- `postcss.config.js` – PostCSS pipeline with Tailwind + Autoprefixer
- `assets/css/tailwind.css` – Tailwind entry file

Recommended setup:
1. Install dev dependencies:
   - `npm i -D tailwindcss postcss autoprefixer`
2. Build once:
   - `npx tailwindcss -i assets/css/tailwind.css -o assets/css/build.css --minify`
3. Reference `assets/css/build.css` in pages instead of the CDN script. Keep `assets/css/styles.css` for custom tokens/components.

Optional: add npm scripts in package.json
```
{
  "scripts": {
    "tw:build": "tailwindcss -i assets/css/tailwind.css -o assets/css/build.css --minify",
    "tw:watch": "tailwindcss -i assets/css/tailwind.css -o assets/css/build.css --watch"
  }
}
```

When switching to the built CSS, remove the Tailwind CDN `<script>` tags and add:
```
<link rel="stylesheet" href="assets/css/build.css">
```
