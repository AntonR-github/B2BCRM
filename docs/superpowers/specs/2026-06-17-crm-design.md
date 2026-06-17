# B2B CRM — Content Management System Design

## Overview

A CRM built in Next.js that acts as a headless content management system for multiple Next.js client websites. The client (non-technical) can log in and manage blog posts, editable text sections, and SEO metadata across all their sites. The developer (admin) sets up and integrates each site.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Database | PostgreSQL via Neon |
| ORM | Prisma |
| Auth | NextAuth.js |
| Rich text editor | TipTap |
| Image/media storage | Cloudinary |
| Hosting | Vercel |

---

## Users & Roles

**Admin (developer):**
- Add and configure new sites
- Define which text fields are editable per site
- Create and manage user accounts
- Access to all sites and all data

**Editor (client + their staff):**
- Log in and see all sites
- Write and publish blog posts
- Edit text field values
- Set SEO metadata per blog and per site
- Cannot change design, layout, or code

---

## Data Model

### User
```
id, email, hashedPassword, role (ADMIN | EDITOR), createdAt
```

### Site
```
id, name, slug, apiKey, createdAt
```
- `slug` is used in API routes: `/api/[slug]/...`
- `apiKey` is a secret the Next.js site sends to authenticate API requests

### TextField
```
id, siteId, key, label, value, type (TEXT | TEXTAREA), order
```
- `key` is the machine name (e.g. `hero_title`)
- `label` is the human-readable name shown in the CRM (e.g. "Hero Title")
- `type` controls whether the UI shows a single-line input or multi-line textarea
- `order` controls the display order in the editor
- Defined by the admin when setting up a site; the editor only fills in values

### BlogPost
```
id, siteId, title, slug, body (HTML), status (DRAFT | PUBLISHED),
publishedAt, featuredImage (Cloudinary URL),
metaTitle, metaDescription, ogImage (Cloudinary URL),
createdAt, updatedAt
```

### SiteSEO
```
id, siteId, metaTitle, metaDescription, ogImage (Cloudinary URL)
```
- Site-level SEO defaults; individual blog posts can override these

---

## CRM UI Routes

| Route | Description |
|---|---|
| `/login` | NextAuth login page |
| `/dashboard` | Lists all sites in a sidebar; redirects to first site |
| `/sites/[siteId]/blogs` | Blog list with draft/published status |
| `/sites/[siteId]/blogs/new` | Create a new blog post |
| `/sites/[siteId]/blogs/[blogId]` | Edit a blog post |
| `/sites/[siteId]/content` | Edit text field values |
| `/sites/[siteId]/seo` | Edit site-level SEO defaults |
| `/admin` | Admin panel — sites, text field definitions, users |

---

## UI Layout

**Global:**
- Dark theme throughout
- Large, readable font sizes (minimum 15px body, 16px+ inputs, 18px+ headings)
- Sidebar listing all sites; click to switch
- Top navigation tabs per site: Blogs | Content | SEO

**Blog Editor (two-column layout):**
- Left column: title input, auto-generated slug (editable), TipTap rich text body
- Right sidebar: publish settings (status, date, featured image) + SEO panel (meta title with character counter, meta description with character counter, OG image upload)
- Top bar: Save Draft + Publish buttons

**Content Tab:**
- List of labeled text fields defined by the admin
- Each field shows its label and an input or textarea depending on type
- Single "Save Changes" button at the bottom

**SEO Tab:**
- Site-level meta title, meta description, OG image
- Same large font, same character counters as blog SEO panel

**Admin Panel (admin only):**
- Add/remove sites (name, slug — API key auto-generated)
- Per site: add/remove/reorder text field definitions (key, label, type)
- Add/remove user accounts and assign roles

---

## Public API (consumed by Next.js client sites)

All routes are under `/api/[siteSlug]/`. Client sites authenticate by sending the site's API key as a header: `x-api-key: <key>`.

| Method | Route | Description |
|---|---|---|
| GET | `/api/[siteSlug]/blogs` | List all published blog posts |
| GET | `/api/[siteSlug]/blogs/[blogSlug]` | Single published blog post |
| GET | `/api/[siteSlug]/content` | All text field key/value pairs |
| GET | `/api/[siteSlug]/seo` | Site-level SEO defaults |
| POST | `/api/[siteSlug]/revalidate` | Trigger ISR revalidation (called by CRM on publish) |

---

## Next.js Site Integration

When the developer adds a new site to the CRM:
1. Add site in admin panel — get the `slug` and `apiKey`
2. Store `apiKey` in the Next.js site's `.env` as `CRM_API_KEY`
3. Store the CRM base URL as `CRM_URL`
4. In the Next.js site, fetch content using ISR (`revalidate: 60` or similar)
5. Add a Next.js revalidation route (`/api/revalidate`) that accepts a POST with a secret token and calls `revalidatePath()`
6. Store the revalidation secret in the CRM admin panel per site; the CRM calls this endpoint on blog publish

---

## Content Flow

1. Editor logs into CRM
2. Selects a site from the sidebar
3. Creates or edits a blog post → fills in title, body, SEO fields → publishes
4. CRM saves to database, marks post as published, calls `/api/[siteSlug]/revalidate`
5. The Next.js site's ISR cache is invalidated
6. Next visitor to the site sees fresh content within seconds

For text fields:
1. Editor goes to the Content tab → updates field values → saves
2. CRM saves new values to the database
3. Next ISR revalidation cycle picks up the changes (within ~60 seconds)

---

## Key Design Decisions

- **One CRM app, flat structure** — all sites belong to one client; no complex multi-tenancy needed
- **Admin defines text fields, editor fills values** — clients cannot add or remove editable sections; only the developer can
- **API key per site** — simple, stateless authentication for the content API; easy to rotate
- **ISR over SSR** — fast page loads with near-instant content updates; no full rebuilds
- **Cloudinary for images** — handles resizing, CDN delivery, and storage; no self-hosted file management
- **TipTap for rich text** — lightweight, extensible, good UX for non-technical users
