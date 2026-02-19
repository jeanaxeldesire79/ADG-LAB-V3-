# Publications Family Portal

The `publications_family` folder contains the modular knowledge portal for Axel Dev Group. Each publication type page is HTML-only, styled with TailwindCSS via CDN, and enhanced with a lightweight JavaScript controller (`assets/js/publications.js`) that loads shared partials and handles interaction hooks.

## Extending the Library

- **Add new publications:** Duplicate a card block from the relevant page (`briefs.html`, `memos.html`, `papers.html`, `reports.html`, or `press.html`), update the title, abstract, metadata, and point the primary button to the corresponding PDF inside `assets/pdf/`. Maintain accent classes (e.g., `accent-briefs`) to keep the visual language consistent.
- **Link new PDFs:** Upload files to `assets/pdf/` and reference them with relative links (e.g., `./assets/pdf/new-brief.pdf`). The folder is web-accessible and shared across all publication pages.
- **Update authors:** Edit `authors.html` to add or modify author cards. Match the `data-category` attribute to existing filters (`lab`, `consulting`, `advisory`, `fellow`) or introduce a new filter by adding a button with a matching `data-filter` value.
- **Refresh research axes:** Update `axes.html` to point cards toward new filtered listings or insights. Each axis card uses the `.axis-card` component and can be re-linked to microsites or search results when available.

All shared layout elements live in `partials/header.html` and `partials/footer.html`. When changes are made to branding, update those partials once and every page will inherit the adjustment automatically.
