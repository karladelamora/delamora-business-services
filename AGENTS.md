# Project Instructions: De La Mora Business Services

## Collaborators & Commits
- **Owner**: Karla De La Mora (`Karla@DeLaMorabusiness.com` / GitHub: `karladelamora`).
- **Admin**: Wade Williams (`Waderaid@hotmail.com` / GitHub: `Waderaid`).
- **Auto-Commit & Push**: Whenever changes or improvements are made to website files in this workspace, **always automatically stage, commit, and push directly to `main`**. Use the local machine's configured user identity or detect whether Karla or Wade is the session user.
- Note: Avoid creating `.github/workflows/` files unless explicitly requested, as standard GitHub PATs require special `workflow` scope.

## Page Structure & Mobile Experience
- **Live Page (`index.html`)**: Current public-facing page (Coming Soon landing page). Do not overwrite without explicit instruction to launch the site.
- **Staging / Test Page (`test.html`)**: Working draft containing the full website, services grid, interactive estimator, and new features being tested before going live. All content edits and experiments belong here first.
- **Mobile-First Dynamic Quality**: Always ensure website files in this workspace are fully dynamic and look amazing on phones (fluid typography with clamp, minimum 48px touch targets, font-size >= 16px on inputs to prevent iOS auto-zoom, and responsive interactive navigation).

## Automated Deployment
- GitHub Pages is configured to deploy directly from `main` branch root (`/`). Every push automatically builds and updates the live site.
