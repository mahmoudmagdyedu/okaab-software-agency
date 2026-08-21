# Add the eagle logo and remove Lovable branding

## What changes

1. **Logo in the navbar** — replace the small circle with the "ع" letter with the uploaded eagle mark, same 32px size and position. The "عُقاب" wordmark and the OKAAB script text stay exactly as they are.
2. **Logo in the footer** — the small accent circle becomes the same eagle mark at its current 24px size.
3. **Favicon** — a square copy of the eagle replaces the current favicon, so the browser tab and shared links show the real logo.
4. **Social preview + structured data** — the JSON-LD logo/image URLs point at the new logo file instead of the old favicon.
5. **Remove Lovable traces** —
   - Turn off the "Edit with Lovable" badge on the published site.
   - Strip any Lovable naming from page metadata, and switch the site URLs used in metadata, JSON-LD, sitemap and robots.txt to the custom domain `https://okaab.org` instead of the `.lovable.app` URL.

## Technical notes

- The logo is uploaded to CDN storage via a `.asset.json` pointer in `src/assets/` and imported into `OkaabLanding.tsx` as an `<img>` with an alt text; `public/favicon.png` gets a real square 64x64 padded copy (favicons cannot be CDN pointers).
- Badge visibility is toggled through publish settings, not code.
- Internal error-reporting plumbing (`lovable-error-reporting`) is part of the preview/runtime harness, not visible branding — it stays.

## Not included

- No layout, spacing, color, or animation changes.
