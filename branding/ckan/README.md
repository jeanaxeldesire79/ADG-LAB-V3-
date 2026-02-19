# CKAN Theme
- CSS: `public/assets/css/theme.css`
- Home override: `templates/home/index.html`
- Logo: `public/assets/img/logo.png` (replace with your real logo)

## Enable theme
- Add to CKAN config (`ckan.ini`) or use a theme extension loader.
- Example (if using extra template directories):
  ckan.plugins = stats text_view image_view recline_view
  ckan.extra_template_paths = /srv/app/ckan/ckanext-theme/templates
  ckan.extra_public_paths = /srv/app/ckan/ckanext-theme/public
