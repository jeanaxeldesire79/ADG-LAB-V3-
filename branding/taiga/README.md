# Taiga Frontend Branding
Mount path: ./branding/taiga → /usr/share/nginx/html/assets/branding

## Steps
- Replace `logo.svg` and `favicon.png`.
- In taiga-front config (config.json or env), point:
  - `"logo"` to `/assets/branding/logo.svg`
  - `"favicon"` to `/assets/branding/favicon.png`
- Restart taiga-front.
