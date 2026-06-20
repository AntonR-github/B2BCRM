# B2B CRM — System Documentation

## Overview

A headless CRM built in Next.js that manages content, orders, media, and form submissions for multiple Next.js client websites. The client can log in and manage their site without touching code. The developer sets up and integrates each new site.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL via Supabase |
| ORM | Prisma 7 + @prisma/adapter-pg |
| Auth | NextAuth.js v5 |
| Rich text editor | TipTap v3 |
| Image/media storage | Supabase Storage (`crm-images` bucket) |
| Hosting | Vercel (or self-hosted) |

---

## Data Model

### Site
```
id, name, slug, apiKey, revalidateSecret, revalidateUrl, createdAt
```
- `slug` is used in all API routes: `/api/[slug]/...`
- `apiKey` is sent by the client site as `x-api-key` header to authenticate requests
- `revalidateSecret` + `revalidateUrl` — the CRM calls this URL after content changes to trigger ISR on the client site

### TextField
```
id, siteId, key, label, value, type (TEXT | TEXTAREA), page, order
```
- `key` is the machine name used in the client site (e.g. `hero_title`, `compare.prod1_name`)
- `page` groups fields into tabs in the content editor (e.g. `general`, `compare`, `shop`)
- Admin defines fields; editors fill values

### BlogPost
```
id, siteId, title, slug, body (HTML), status (DRAFT | PUBLISHED),
publishedAt, featuredImage, metaTitle, metaDescription, ogImage,
tags[], createdAt, updatedAt
```

### SiteSEO
```
id, siteId, metaTitle, metaDescription, ogImage, schemaLogo, schemaSameAs
```

### FormSubmission
```
id, siteId, name, email, phone?, message, read (bool), createdAt
```
- Created when a contact form is submitted on the client site
- CRM shows an inbox with unread badge

### Order
```
id (external, e.g. XV-1234567890), siteId,
status (pending | paid | shipped | cancelled),
total, shipping, customerName, customerEmail, customerPhone, customerAddress,
items (JSON array of {id, name, price, qty}),
payperDocId?, shippingNote?, createdAt, updatedAt
```
- Created when a customer initiates checkout (status: pending)
- Marked paid after payment gateway confirms success
- `shippingNote` is used for tracking numbers or internal notes
- Status can be updated directly from the Orders tab (dropdown per order)
- `payperDocId` is the Payper invoice-receipt number, set after generation

### Coupon
```
id, siteId, code (unique per site), type (PERCENT | FIXED), value,
expiresAt?, maxUses?, usedCount, active (bool), createdAt
```
- `PERCENT` discounts by percentage of cart subtotal
- `FIXED` discounts by a flat ILS amount
- `usedCount` increments when an order using that code is created
- Disabled coupons and expired/exhausted coupons are rejected at validation

### Product
```
id, siteId, handle (URL slug, unique per site), name, price, description?,
badge?, image?, payperSku?, cardFeatures (string[]), features (string[]),
active (bool), order (int), createdAt, updatedAt
```
- Managed in the CRM Products tab; served via `/api/[siteSlug]/products`
- Client site falls back to hardcoded products if the API returns empty
- `payperSku` links to Payper inventory item for stock reduction on invoice
- `cardFeatures` = short list shown on product card; `features` = full list for detail/compare

---

## CRM UI Routes

| Route | Description |
|---|---|
| `/login` | NextAuth login page |
| `/dashboard` | Lists all sites; redirects to first site |
| `/sites/[siteId]/blogs` | Blog list with draft/published status |
| `/sites/[siteId]/blogs/new` | Create blog post |
| `/sites/[siteId]/blogs/[blogId]` | Edit blog post |
| `/sites/[siteId]/content` | Edit text field values; image fields show upload widget |
| `/sites/[siteId]/seo` | Edit site-level SEO defaults |
| `/sites/[siteId]/dashboard` | Overview: stats, recent orders, recent submissions |
| `/sites/[siteId]/submissions` | Contact form inbox with unread count |
| `/sites/[siteId]/media` | Media library — upload images to Supabase Storage |
| `/sites/[siteId]/orders` | Orders with status dropdown, tracking notes, Payper doc |
| `/sites/[siteId]/coupons` | Coupon codes — create, enable/disable, delete |
| `/sites/[siteId]/products` | Products — create, edit, image upload, Payper SKU |
| `/admin` | Admin panel — sites, text field definitions, users |

---

## Public API (consumed by client sites)

All routes are under `/api/[siteSlug]/`. Authenticated with `x-api-key: <apiKey>` header.

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/[siteSlug]/blogs` | No | List all published blog posts |
| GET | `/api/[siteSlug]/blogs/[blogSlug]` | No | Single published blog post |
| GET | `/api/[siteSlug]/content` | No | All text field key/value pairs |
| GET | `/api/[siteSlug]/seo` | No | Site-level SEO defaults |
| POST | `/api/[siteSlug]/submit` | Yes | Save a contact form submission |
| POST | `/api/[siteSlug]/orders` | Yes | Create a pending order (also increments coupon usedCount) |
| POST | `/api/[siteSlug]/orders/[orderId]/confirm` | Yes | Mark order paid + generate Payper invoice |
| POST | `/api/[siteSlug]/validate-coupon` | No | Validate a coupon code, returns type + value |
| GET  | `/api/[siteSlug]/products` | No | List active products (60s cache) |
| POST | `/api/upload` | Session | Upload image to Supabase Storage |
| DELETE | `/api/media/delete` | Session | Delete image from Supabase Storage |

---

## Supabase Storage

Images are stored in a single public bucket called `crm-images`.

Files are organized by site slug: `{siteSlug}/{timestamp}-{random}.{ext}`

This keeps images per-site without needing separate buckets. The public URL is used directly in content fields and on client sites.

Image fields in content are detected by key suffix: `_image` or `_bg`. They render an upload widget in the content editor instead of a plain text input.

---

## E-Commerce Integration (xvape pattern)

This describes how a client site with a shop and payment flow connects to the CRM + external services.

### Services involved

| Service | Role |
|---|---|
| CRM + Supabase | Order storage and management |
| Payper | Inventory stock levels + automatic invoicing after sale |
| Hyp Pay | Card payment processing |
| SMTP | Order confirmation email to customer |

### Payment flow

1. Customer fills checkout form (name, email, phone, address, city, zip)
2. Client site generates `orderId = XV-{timestamp}`
3. POST to `/api/hyp-checkout` with `{amount, orderId, shipping, customer, items}`
4. hyp-checkout route saves **pending order** to CRM, then calls Hyp Pay `APISign`
5. Returns `paymentUrl` → browser redirects to Hyp Pay hosted payment page
6. Customer pays → Hyp Pay redirects to `/payment/success?Order=XV-...&Amount=...`
7. Success page calls `/api/payment/confirm` with `{orderId}`
8. payment/confirm calls CRM `POST /api/[siteSlug]/orders/[orderId]/confirm`
9. CRM marks order **paid** + calls Payper `/generate_invoice_receipt`
10. Payper invoice is emailed to customer; `payperDocId` is stored on the order

### Payper invoice notes

Invoice lines are created from the cart items. To enable automatic stock reduction in Payper, each invoice line needs a `catalog_id` matching the item's Payper SKU (makat). Without `catalog_id`, the invoice is created but stock is not reduced.

Once products are set up in Payper with known SKUs, add the SKU to each product's CMS content fields (e.g. `shop.prod1_sku`) and pass it as `catalog_id` in the invoice line.

### Environment variables (client site)

```env
# CRM connection (server-side)
CRM_URL=https://your-crm-domain.com
CRM_API_KEY=<apiKey from CRM admin panel>
CRM_SITE_SLUG=<site slug>

# CRM connection (client-side — for coupon validation from browser)
NEXT_PUBLIC_CRM_URL=https://your-crm-domain.com
NEXT_PUBLIC_CRM_SITE_SLUG=<site slug>

# Hyp Pay (from Hyp Pay terminal dashboard)
HYP_MASOF=<terminal number>
HYP_KEY=<api key>
HYP_PASSP=<api password>

# Must be set to real domain for Hyp Pay success/failure redirects
NEXT_PUBLIC_SITE_URL=https://your-client-domain.com

# Payper
PAYPER_API_KEY=<from Payper Api Settings>
PAYPER_ACCOUNT=<api_user email from Payper Api Settings>

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<gmail address>
SMTP_PASS=<gmail app password>
```

### Environment variables (CRM)

```env
DATABASE_URL=<Supabase pooled connection string>
DIRECT_URL=<Supabase direct connection string>
NEXT_PUBLIC_SUPABASE_URL=<Supabase project URL>
SUPABASE_SERVICE_ROLE_KEY=<Supabase service role key>
AUTH_SECRET=<random secret for NextAuth>
AUTH_URL=https://your-crm-domain.com
PAYPER_API_KEY=<from Payper Api Settings>
PAYPER_ACCOUNT=<api_user email from Payper Api Settings>
```

---

## Adding a New Site — Checklist

### 1. CRM setup
- [ ] Log in to CRM admin panel → Add site (name + slug)
- [ ] Copy the generated `apiKey` and `revalidateSecret`
- [ ] Define text fields for the site (key, label, type, page group)
- [ ] Create the `crm-images` Supabase Storage bucket if it doesn't exist (public, no expiry)

### 2. Client site setup
- [ ] Add `.env.local` with `CRM_URL`, `CRM_API_KEY`, `CRM_SITE_SLUG`
- [ ] Add `NEXT_PUBLIC_SITE_URL` set to the real domain
- [ ] Fetch content with `getContent()` using ISR (`revalidate: 60` or `revalidatePath`)
- [ ] Add `/api/revalidate` route that calls `revalidatePath('/')` when pinged by CRM
- [ ] Set `revalidateUrl` in CRM admin to `https://your-client-domain.com/api/revalidate`

### 3. If the site has a contact form
- [ ] Client site `POST /api/contact` sends form data to CRM `POST /api/[siteSlug]/submit` after emailing
- [ ] Use `x-api-key` header with the site's API key

### 4. If the site has a shop and payments
- [ ] Add Hyp Pay credentials to client `.env.local`
- [ ] Add Payper credentials to both client `.env.local` and CRM `.env.local`
- [ ] Add SMTP credentials to client `.env.local`
- [ ] Add `NEXT_PUBLIC_CRM_URL` and `NEXT_PUBLIC_CRM_SITE_SLUG` to client `.env.local` (for coupon validation)
- [ ] Wire up `POST /api/hyp-checkout` (saves pending order to CRM, returns Hyp Pay URL)
- [ ] Wire up `POST /api/payment/confirm` (called on success page, confirms order in CRM)
- [ ] Add products in CRM → Products tab (or start with hardcoded fallbacks)
- [ ] Set up products in Payper with SKUs; add SKU to each product's `payperSku` field in CRM
- [ ] Configure success/failure URLs in Hyp Pay terminal dashboard to match `NEXT_PUBLIC_SITE_URL`
- [ ] Create coupons in CRM → Coupons tab as needed

---

## Content Flow

### Blog post
1. Editor creates/edits post in CRM → publishes
2. CRM saves to DB, calls `revalidateUrl` on the client site
3. Client site ISR cache is cleared; next visitor sees fresh content

### Text fields / content
1. Editor updates field values in CRM → saves
2. CRM saves to DB, calls `revalidateUrl` on the client site
3. Client site re-fetches content on next request within ISR window

### Image fields
- Fields with keys ending in `_image` or `_bg` show an upload widget in the content editor
- Images are uploaded to Supabase Storage under `{siteSlug}/filename`
- The resulting public URL is saved as the field value and used directly on the client site

---

## Key Design Decisions

- **One CRM, multiple sites** — flat multi-tenancy via site slug; all sites belong to one operator
- **Supabase for everything** — single platform for DB (PostgreSQL) and file storage; no separate Cloudinary account needed
- **Orders saved before payment** — order is created as `pending` before redirecting to Hyp Pay, so no order is lost if the user closes the tab after paying
- **Payper invoice is post-payment** — invoice-receipt is generated only after payment confirmation, which is the legally correct order
- **API key per site** — simple stateless auth for all public API routes; rotate in CRM admin if compromised
- **ISR over SSR** — fast page loads with near-instant content updates; no full rebuilds needed
- **Non-fatal integrations** — CRM submission saving, Payper invoice generation, and ISR revalidation are all wrapped in try/catch so a downstream failure never breaks the user-facing action (email sent, payment taken)
- **Products fallback** — client site falls back to hardcoded products if CRM returns an empty list, so migration from hardcoded to CRM-managed is gradual and safe
- **Coupon usage is tracked on order creation** — `usedCount` increments when the order is saved (pending), not on payment, so the slot is reserved even if payment fails
- **Manual revalidate** — "Refresh site" button on Content and SEO pages lets editors force ISR cache clearing without waiting for the revalidation window
- **Dashboard** — each site has an overview page showing unread submissions, pending orders, draft posts, and recent activity at a glance
