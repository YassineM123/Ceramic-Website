# Admin Dashboard API

Base URL: `/api`

Authentication: protected endpoints require `Authorization: Bearer <accessToken>`. Public storefront endpoints are listed under Public Website.

Response shape:

```json
{ "data": {}, "meta": { "total": 1 } }
```

Error shape:

```json
{ "code": "VALIDATION_ERROR", "message": "field is required" }
```

Common status codes:

- `200 OK`: read/update/delete action succeeded
- `201 Created`: resource created
- `202 Accepted`: async sync job accepted
- `400 Bad Request`: invalid input
- `401 Unauthorized`: missing/invalid token
- `403 Forbidden`: token lacks permission
- `404 Not Found`: resource does not exist
- `409 Conflict`: business rule conflict
- `413 Payload Too Large`: request body or upload is too large
- `415 Unsupported Media Type`: upload type is not allowed
- `500 Internal Server Error`: unexpected server error

## Orders

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/orders?search=&status=&paymentStatus=&deliveryStatus=` | List and filter orders |
| `GET` | `/orders/:id` | Get one order |
| `POST` | `/orders` | Create an order |
| `POST` | `/orders/manual` | Create a validated dashboard/manual order |
| `PATCH` | `/orders/:id` | Partial update |
| `PUT` | `/orders/:id` | Replace/update full order payload |
| `DELETE` | `/orders/:id` | Delete an order |
| `POST` | `/orders/:id/cancel` | Cancel an order with `{ "reason": "..." }` |
| `POST` | `/orders/:id/refund` | Refund an order with `{ "amount": 20, "reason": "..." }` |
| `PATCH` | `/orders/:id/tracking` | Update shipping with `{ "trackingNumber": "...", "courier": "...", "eta": "2026-07-10", "deliveryStatus": "On the way" }` |
| `GET` | `/orders/:id/timeline` | Read customer/order timeline |
| `GET` | `/orders/:id/invoice.pdf` | Generate or reuse invoice and return PDF `{ filename, contentType, base64 }` |
| `GET` | `/orders/export.csv` | Export filtered orders as CSV |
| `GET` | `/orders/export.xlsx` | Export filtered orders as Excel-compatible file |

Valid order statuses: `New`, `Confirmed`, `Preparing`, `Shipped`, `Delivered`, `Cancelled`, `Returned`.

## Uploads

Uploads use JSON base64 payloads so they work with the custom Node HTTP server.

```json
{
  "purpose": "product-image",
  "fileName": "shoe.webp",
  "contentType": "image/webp",
  "dataBase64": "data:image/webp;base64,..."
}
```

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/uploads?purpose=product-image` | List uploads |
| `GET` | `/uploads/:id` | Get upload metadata |
| `POST` | `/uploads` | Store a new upload |
| `PUT` | `/uploads/:id` | Replace file contents and metadata |
| `DELETE` | `/uploads/:id` | Delete metadata and disk file |

Allowed purposes: `product-image`, `category-image`, `hero-image`, `gallery-image`, `logo`, `icon`, `document`.

Allowed images: JPEG, PNG, WEBP, GIF, SVG up to 8MB. Allowed documents: PDF, TXT, CSV, DOC, DOCX, XLS, XLSX up to 15MB.

Stored files are served at `/uploads/:purpose/:uniqueFilename`.

## Catalog And Customers

| Resource | Methods |
| --- | --- |
| `/products` | `GET`, `POST`; `/products/:id` supports `GET`, `PUT`, `PATCH`, `DELETE` |
| `/customers` | `GET`, `POST`; `/customers/:id` supports `GET`, `PUT`, `PATCH`, `DELETE` |
| `/deliveries` | `GET`, `POST`; `/deliveries/:id` supports `GET`, `PUT`, `PATCH`, `DELETE` |
| `/invoices` | `GET`, `POST`; `/invoices/:id` supports `GET`, `PUT`, `PATCH`, `DELETE`; `/invoices/:id/pdf` returns PDF |
| `/delivery-notes` | `GET`; `/delivery-notes/:id` supports `GET`, `PUT`, `PATCH`, `DELETE`; `/delivery-notes/:id/pdf` returns PDF |

## Website Sync

Public storefront:

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/public/website` | Full storefront payload |
| `GET` | `/public/products` | Storefront products |
| `GET` | `/public/categories` | Storefront categories |
| `POST` | `/public/orders` | Checkout order creation, synced into dashboard orders |
| `POST` | `/public/contact-messages` | Contact form submission |
| `POST` | `/public/newsletter` | Newsletter signup |

Admin website content:

| Resource | Methods |
| --- | --- |
| `/website/content` | `GET`, `PUT`, `PATCH` |
| `/categories` | `GET`, `POST`; `/categories/:id` supports `GET`, `PUT`, `PATCH`, `DELETE` |
| `/coupons` | `GET`, `POST`; `/coupons/:id` supports `GET`, `PUT`, `PATCH`, `DELETE` |
| `/discounts` | `GET`, `POST`; `/discounts/:id` supports `GET`, `PUT`, `PATCH`, `DELETE` |
| `/shipping-zones` | `GET`, `POST`; `/shipping-zones/:id` supports `GET`, `PUT`, `PATCH`, `DELETE` |
| `/tax-rates` | `GET`, `POST`; `/tax-rates/:id` supports `GET`, `PUT`, `PATCH`, `DELETE` |
| `/collections` | `GET`, `POST`; `/collections/:id` supports `GET`, `PUT`, `PATCH`, `DELETE` |
| `/reviews` | `GET`, `POST`; `/reviews/:id` supports `GET`, `PUT`, `PATCH`, `DELETE` |
| `/blogs` | `GET`, `POST`; `/blogs/:id` supports `GET`, `PUT`, `PATCH`, `DELETE` |
| `/contact-messages` | `GET`, `POST`; `/contact-messages/:id` supports `GET`, `PUT`, `PATCH`, `DELETE` |
| `/newsletter-subscribers` | `GET`, `POST`; `/newsletter-subscribers/:id` supports `GET`, `PUT`, `PATCH`, `DELETE` |

## Operational Resources

| Resource | Methods |
| --- | --- |
| `/leads` | `GET`, `POST`; `/leads/:id` supports `GET`, `PUT`, `PATCH`, `DELETE`; `/leads/bulk` applies grouped actions |
| `/leads/scrape-jobs` | `POST`; `/leads/scrape-jobs/:id` supports `GET` |
| `/notifications` | `GET`, `POST`; `/notifications/:id/read` marks one read; `/notifications/mark-all-read` marks all read; `/notifications/:id` supports `DELETE` |
| `/marketing/campaigns` | `GET`, `POST`; `/marketing/campaigns/:id` supports `GET`, `PUT`, `PATCH`, `DELETE` |
| `/ads/campaigns` | `GET`, `POST`; `/ads/campaigns/:id` supports `GET`, `PUT`, `PATCH`, `DELETE` |
| `/expenses` | `GET`, `POST`; `/expenses/:id` supports `PUT`, `PATCH`, `DELETE` |
| `/sales-channels` | `GET`, `POST`; `/sales-channels/:id` supports `GET`, `PUT`, `PATCH`, `DELETE` |
| `/sync-jobs` | `GET`; `/sync-jobs/:id` supports `GET` |
| `/settings` | `GET`, `PATCH` |
| `/admin-users` | `GET`, `POST`; `/admin-users/:id` supports `PATCH`, `DELETE` |

Full-form update clients can use `PUT` where listed; partial dashboard edits can use `PATCH`.
