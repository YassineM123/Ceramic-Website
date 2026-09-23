# Le Monde Ceramique Monorepo

Single npm-managed monorepo for the e-commerce storefront, admin dashboard, and shared backend.

## Structure

```text
frontend/  E-commerce Vite app
admin/     Admin dashboard Vite app
backend/   Shared API, auth, data, and SQLite/json storage
scripts/   Root development and smoke-test scripts
docs/      Project documentation
```

## Tech Stack

- React 18
- TypeScript
- Vite 6
- Tailwind CSS 4
- Node.js backend with one auth system and one data directory
- Motion for animation
- Lucide React for icons

## Getting Started

Install dependencies:

```bash
npm install
```

Run the local development server:

```bash
npm run dev
```

This starts the connected stack:

```text
Frontend: http://localhost:5173
Admin dashboard: http://localhost:5174/admin/login
Shared API: http://localhost:4000/api
```

The website reads products, homepage content, checkout orders, contact messages, and
newsletter submissions from the admin dashboard backend through `/api`.

Default admin login:

```text
Email: admin@client.com
Password: Admin@12345
```

Build the storefront:

```bash
npm run build
```

Build both the website and admin dashboard:

```bash
npm run build:all
```

Backend utility commands:

```bash
npm run db:verify
npm run smoke:api
```

If the admin dashboard is hosted somewhere else, set this before building the website:

```bash
VITE_ADMIN_DASHBOARD_URL=https://your-admin-domain.com/admin/login
```

## Implemented Pages

- Home: hero, featured collections, best sellers, process, values, gallery, testimonials, social preview, newsletter.
- Shop: search, category filtering, price filtering, sorting, grid/list views, favorites, quick view, add to cart.
- Product Detail: gallery, quantity selector, wishlist, add to cart, buy now, tabs, reviews, related products.
- Cart: drawer, quantity updates, remove items, free-shipping threshold, checkout handoff.
- Checkout: shipping form, payment demo form, order summary, order confirmation.
- About: brand story, values, timeline, team, shopping CTA.
- Contact: contact cards, validated form, success state, studio details, hours, social links.

## QA Status

Verified locally on June 3, 2026:

```bash
npm run build
```

Rendered smoke test with Playwright and local Chrome:

```text
home -> shop -> add to cart -> cart drawer -> checkout -> place order -> order confirmed
```

Desktop screenshot viewport: `1440x1000`.
Mobile screenshot viewport: `390x844`.

## Notes

Checkout is a frontend demo. Do not enter real payment details.

Images are loaded from Unsplash URLs used by the existing project assets.
