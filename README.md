# De La Mora Business Services

Official website repository for **De La Mora Business Services** (San Diego County, CA).
Live at: `https://delamorabusiness.com`

## Overview
De La Mora Business Services delivers operational efficiency, clean bookkeeping, and financial control to small and medium businesses throughout San Diego County:
- **Monthly Bookkeeping & Reconciliations** (Tax-ready monthly financial statements, AP/AR, payroll support)
- **Books Catch & Clean-Up** (Historical QuickBooks cleanup, backlog reconciliation)
- **Warehouse Inventory Administration** (Physical cycle count supervision, SKU tracking, inventory valuation)
- **Internal Control & Advisory** (Operational reviews, audit workpaper support, Deloitte-rooted process improvement)

## Key Technical Features
- **Bilingual Infrastructure (English & Español)**: Instant client-side switching, URL routing (`?lang=en` / `?lang=es`), and localized metadata.
- **Local SEO & Schema.org**: Fully structured `AccountingService` and `FAQPage` JSON-LD targeting 18 San Diego County municipalities.
- **Favicon & Web App Manifest**: Pin-sharp SVG and multi-resolution PNG icons for Google SERP branding, Apple iOS bookmarks, and Android PWA installability.
- **Core Web Vitals & PageSpeed**: All image assets extracted to standalone files, explicit width/height dimensions, and LCP preloading for zero layout shift (CLS).
- **Google Tag & Analytics**: Integrated Google Tag container (`GTM-MD4ZM8XW`) with Google Analytics 4 event bridge.
- **Zero-Dependency Built-In Analytics**: Self-hosted tracker (`assets/dlm-analytics.js`) with in-browser admin dashboard modal (press `Ctrl+Shift+A` or append `?analytics=view`).

## Page Architecture
- **Live Production (`index.html`)**: The primary public-facing responsive website.
- **About Us (`about.html`)**: Detailed background, methodology, and team bios.
- **Error Page (`404.html`)**: Branded bilingual 404 recovery page.
- **Staging / Sandbox (`test.html`)**: Working draft environment for testing new layouts.

## Collaborators
- **Karla De La Mora** (`Karla@DeLaMorabusiness.com`) — Owner / Founder
- **Wade Williams** (`Waderaid@hotmail.com`) — Website Admin

## Deployment
Hosted on GitHub Pages directly from the `main` branch (`/` root). Every push to `main` deploys live automatically.
