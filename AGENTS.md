# Project Instructions: De La Mora Business Services

## Collaborators & Commits
- **Owner**: Karla De La Mora (`Karla@DeLaMorabusiness.com` / GitHub: `karladelamora`).
- **Admin**: Wade Williams (`Waderaid@hotmail.com` / GitHub: `Waderaid`).
- **Auto-Commit & Push**: Whenever changes or improvements are made to website files in this workspace, **always automatically stage, commit, and push directly to `main`**. Use the local machine's configured user identity or detect whether Karla or Wade is the session user.
- Note: Avoid creating `.github/workflows/` files unless explicitly requested, as standard GitHub PATs require special `workflow` scope.

## Page Structure & Status
- **Live Page (`index.html`)**: Production live website with full services, pricing tiers, action plan, contact form, local SEO, Schema.org markup, and Google Tag (`GTM-MD4ZM8XW`).
- **About Page (`about.html`)**: In-depth about page detailing Karla De La Mora's 20+ year background, methodology, and Deloitte consulting partnership.
- **Staging / Test Page (`test.html`)**: Working staging draft for experimenting with new features before pushing to `index.html`.
- **SEO & Indexing**: `robots.txt` and `sitemap.xml` with bilingual English/Spanish hreflang tags.
- **Analytics & CRO**: Built-in privacy-focused tracker (`assets/dlm-analytics.js`) + Google Tag (`GTM-MD4ZM8XW`) with admin dashboard (`Ctrl+Shift+A` or `?analytics=view`).

## Automated Deployment
- GitHub Pages is configured to deploy directly from `main` branch root (`/`). Every push automatically builds and updates the live site.
