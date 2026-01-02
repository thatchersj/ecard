# Virtual Card Site (GitHub Pages)

This is a fully static site intended for GitHub Pages.

## Files
- `index.html` — card generator (creates shareable links)
- `card.html` — card viewer (recipients open this link)
- `images/` — built-in images + `manifest.json`

## Deploy to GitHub Pages
1. Create a repo (e.g. `virtual-cards`)
2. Upload the contents of this zip to the repo root
3. Enable **Settings → Pages → Deploy from a branch** (usually `main` / `/root`)
4. Your generator will be at: `https://<user>.github.io/<repo>/`
5. Generated links will work anywhere the site is hosted.

## Notes
- The generated `c=` query parameter is a reversible Base64URL-encoded JSON payload.
- The card page sanitizes the message HTML (basic allowlist) to avoid scripts.
