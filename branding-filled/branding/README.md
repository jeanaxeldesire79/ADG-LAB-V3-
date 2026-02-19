# Axel Dev Lab — Branding Assets
A single place for logos, colors, and templates used across the platform.

## Brand Palette
- **Gold**: `#FFD700` (primary)
- **Jet Black**: `#111111` (backgrounds/headers)
- **White**: `#FFFFFF` (text on dark backgrounds)
- **Slate**: `#2B2B2B` (secondary text)
- **Accent**: `#FFB400` (hover/focus)

## Typography
- Prefer system-safe stack or Google Fonts: **Inter**, **Roboto**, or **Work Sans**.
- Use medium/semibold for headings; regular for body.

## Mount Points (from docker-compose)
- `./branding/ckan`  → `/srv/app/ckan/ckanext-theme`
- `./branding/invenio` → `/opt/invenio/static/theme`
- `./branding/suitecrm` → `/branding`
- `./branding/wikijs/custom.css` → `/var/wiki/assets/custom.css`
- `./branding/taiga` → `/usr/share/nginx/html/assets/branding`
- `./branding/docuseal` → `/app/public/branding`
- `./branding/superset` → referenced by `superset_config.py`
- `./branding/lg_axeldevlab.png` → used by **NocoDB** NC_BRAND_LOGO

## Usage Order
1. Replace each placeholder logo (PNG/SVG) with your real assets.
2. Adjust the CSS files to match final colors/typography.
3. Redeploy the affected services.
