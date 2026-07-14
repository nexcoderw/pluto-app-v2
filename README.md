# Pluto Booking Web App

Next.js customer and partner frontend for Pluto Booking.

This app is the public marketplace, customer portal, and partner portal. Public visitors can browse listings, customers can manage bookings, favorites, reviews, profile, and audit logs, and approved partners can manage listings, onboarding, and workspace pages.

Admin and superadmin dashboards do not belong in this project. Admin functionality belongs in:

```txt
../admin
```

## Project Identity

```txt
Project name: Pluto Booking Web App
Project type: Public marketplace + Customer portal + Partner portal
Framework: Next.js
Language: TypeScript
Package manager: npm
Default local port: 4000
Primary backend: Pluto Booking NestJS API
```

Recommended local URL:

```txt
http://localhost:4000
```

## What This App Owns

- Public homepage and marketplace navigation.
- Public listing category pages for cars, apartments, hotel rooms, and Airbnb stays.
- Category-specific listing cards, filters, maps, pagination, and detail pages.
- Listing reviews and review dialogs.
- Listing favorite interactions and customer favorite page.
- Auth pages for login, registration, email verification and resend, partner registration, forgot password, reset password, Google callback, and phone completion.
- Customer portal pages for dashboard, bookings, favorites, payments, profile, and audit logs.
- Partner onboarding and partner workspace pages.
- Partner listing create, edit, detail, delete, image upload, and status flows.
- Profile update, profile image upload, and password change UI.
- Shared public navbar, footer, customer sidebar, partner shell, booking sidebar, date planner, map, gallery, error states, and loading states.

## What This App Must Not Own

Do not build these features here:

- Admin dashboard.
- Superadmin dashboard.
- Admin partner approval management.
- Admin listing approval management.
- Admin audit log supervision.
- Platform-wide user role management.
- Platform-wide security settings.

Those features belong in `../admin`.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- CSS Modules
- shadcn/ui and Base UI
- TanStack Query
- React Hook Form
- Zod
- Axios
- Sonner
- Lucide React
- Framer Motion
- Swiper
- Embla Carousel
- React Day Picker
- MapLibre GL
- Google Places proxy routes
- libphonenumber-js

## Installation

From this project folder:

```bash
npm install
```

Run local development:

```bash
npm run dev
```

The app runs on:

```txt
http://localhost:4000
```

Production build:

```bash
npm run build
```

Production start:

```bash
npm run start
```

## Environment

Create `.env` from `.env.example`.

Current `.env.example`:

```env
NEXT_PUBLIC_APP_NAME="PLUTO Booking"
NEXT_PUBLIC_APP_URL="http://localhost:4000"
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"

GOOGLE_MAPS_API_KEY=""

NEXT_PUBLIC_ENABLE_PARTNER_REGISTRATION=true
NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN=true
```

Important API URL note:

- If the NestJS API is running directly on port `3000`, set `NEXT_PUBLIC_API_URL` to `http://localhost:3000/api/v1`.
- If Next.js rewrites or a local proxy is intentionally forwarding `/api/v1`, `http://localhost:4000/api/v1` is acceptable.
- Do not put backend secrets in this file. Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser, but non-public variables in this app are still not a place for API secrets.

Google Maps and Places:

- `GOOGLE_MAPS_API_KEY` is server-only for the local Next routes in `src/app/api/places`.
- Enable billing and Places API for the same Google Cloud project.
- The public listing map uses MapLibre tiles through the local map route.

## Scripts

```txt
npm run dev    Start Next.js on port 4000.
npm run build  Build production app.
npm run start  Start production app on port 4000.
npm run lint   Run ESLint.
```

Do not run full `npm run build` or full `npm run lint` automatically for the user unless they explicitly ask. Use targeted TypeScript, ESLint, and `git diff --check` when making focused changes.

## Current Route Map

### Public

```txt
/
/listings
/listings/cars
/listings/cars/[listingId]
/listings/apartments
/listings/apartments/[listingId]
/listings/hotel-rooms
/listings/hotel-rooms/[listingId]
/listings/airbnb
/listings/airbnb/[listingId]
/flights
```

### Auth

```txt
/login
/register
/partner-register
/verify-email
/complete-phone
/forgot-password
/reset-password
/auth/google/callback
```

### Customer Portal

```txt
/account
/account/bookings
/account/favorites
/account/payments
/account/profile
/account/audit-logs
/account/flight-requests
```

### Partner Portal

```txt
/partner/dashboard
/partner/listings
/partner/listings/create
/partner/listings/[productId]
/partner/listings/[productId]/edit
/partner/bookings
/partner/payments
/partner/settings
/partner/audit-logs
/partner-onboarding
```

## Current Source Map

```txt
src/
  app/
    (auth)/
    (customer)/
    (partner)/
    (portal)/
    (public)/
    api/
  components/
    account/
    audit-logs/
    auth/
    home/
    listings/
      airbnb/
      apartments/
      cars/
      hotel-rooms/
    partner/
    portal/
    shared/
    ui/
  constants/
  features/
  hooks/
  lib/
  providers/
  services/
    api/
      audit-logs/
      auth/
      favorites/
      listing-options/
      listing-reviews/
      listings/
      partner-products/
      partner-profile/
      places/
      products/
      reference-airports/
  types/
```

## API Integration Rules

All backend calls must go through `src/services/api`.

Use one file per endpoint or endpoint action, grouped by feature:

```txt
src/services/api/auth/login.ts
src/services/api/favorites/list-favorite-listings.ts
src/services/api/listings/list-car-listings.ts
src/services/api/partner-products/create-partner-product.ts
```

Do not call `axios` or `fetch` directly inside pages or visual components unless the route is a local Next route intentionally owned by this app.

Shared API client:

```txt
src/services/api/client.ts
```

## Backend Endpoint Groups Used

```txt
GET    /listing-options
GET    /reference/airports

GET    /listings/cars
GET    /listings/cars/:productId
GET    /listings/apartments
GET    /listings/apartments/:productId
GET    /listings/hotel-rooms
GET    /listings/hotel-rooms/:productId
GET    /listings/airbnb
GET    /listings/airbnb/:productId

GET    /listings/:productId/reviews
GET    /listings/:productId/reviews/summary
POST   /listings/:productId/reviews
PATCH  /listings/:productId/reviews/me
DELETE /listings/:productId/reviews/me

GET    /favorites
GET    /favorites/ids
POST   /favorites/:productId
DELETE /favorites/:productId

GET    /me/audit-logs

POST   /auth/users/register
POST   /auth/users/email-verification/confirm
POST   /auth/users/email-verification/resend
POST   /auth/users/login
POST   /auth/users/refresh
POST   /auth/users/logout
GET    /auth/users/me
PATCH  /auth/users/profile
POST   /auth/users/profile/image
PATCH  /auth/users/password
POST   /auth/users/forgot-password
POST   /auth/users/reset-password
POST   /auth/users/google/complete-phone
GET    /auth/users/google
GET    /auth/users/google/callback

GET    /partner/profile
POST   /partner/profile/individual
PATCH  /partner/profile/individual
POST   /partner/profile/company
PATCH  /partner/profile/company
POST   /partner/profile/submit
POST   /partner/profile/documents
POST   /partner/profile/start-fresh

GET    /partner/products
POST   /partner/products
GET    /partner/products/:productId
PATCH  /partner/products/:productId
DELETE /partner/products/:productId
POST   /partner/products/:productId/images/signature
POST   /partner/products/:productId/images/complete
POST   /partner/products/:productId/images
PATCH  /partner/products/:productId/images/:imageId
DELETE /partner/products/:productId/images/:imageId
```

This app must not use `/admin/...` endpoints.

## Authentication Behavior

- Email/password registration redirects to `/verify-email` and does not create a local authenticated session before confirmation.
- Verification links require an explicit user action, then create the account and secure session.
- Expired or invalid links expose a resend form with cooldown-aware feedback.
- Password login redirects unverified users to the verification recovery page.
- All successful user logins redirect to the homepage.
- Public navbar shows auth buttons when logged out.
- Public navbar shows logged-in user information and a sign-out action when logged in.
- Customer portal links route to `/account`.
- Partner portal links must check partner profile state:
  - `DRAFT`, `PENDING`, or `REJECTED` -> `/partner-onboarding`
  - `APPROVED` -> `/partner/dashboard`
- No flow should log a user out without an explicit logout action or refresh-token failure.
- Unauthorized favorite attempts should open the login dialog and resume the favorite action after login.

## Public Listing Rules

The public marketplace has four category experiences:

- Cars
- Apartments
- Hotel rooms
- Airbnb stays

Each category owns its own card, sidebar/filter UI, detail page, skeleton, and CSS module. Shared primitives live in `src/components/listings`, such as:

```txt
listing-booking-sidebar.tsx
listing-date-planner.tsx
listing-detail-error-state.tsx
listing-favorite-button.tsx
listing-location-map.tsx
listing-login-dialog.tsx
listing-stay-detail-shell.tsx
listing-stay-gallery.tsx
listing-verified-partner-card.tsx
```

Avoid copying shared logic between category detail pages. Extract shared booking, map, gallery, partner-card, login-dialog, error, and date-planner behavior when it repeats.

## Homepage Sections

Current homepage sections:

- Unique homepage navbar and hero using `public/hero/hero.jpg`.
- Advanced category search with car, apartment, hotel room, Airbnb, and disabled flight search.
- Popular Categories with five cards, including coming-soon flight booking.
- Featured Listings with tabs and lightweight cards.
- Why Pluto Booking trust section.
- Partner CTA.

Keep the homepage minimal, fast, and inventory-focused. Avoid heavy animations and avoid decorative gradients.

## Flight Requests

The public flight request wizard uses backend-controlled airport suggestions
from `GET /reference/airports`. The form stores IATA airport codes in the
request payload and keeps selected airport names for responsive on-page
summaries. Customer flight request history should display stored airport names
when the API provides them, with code fallbacks for older records. The wizard
captures one lead traveler plus optional companion travelers with relationship,
name, email, and phone fields. It does not collect a maximum budget.

Submitting a flight request does not take payment. Staff first prepares a
versioned, expiring server quote. The customer must accept that exact quote
before a payment attempt can be created, and verified payment success leads to
ticketing rather than implying a ticket has already been issued.

## Authoritative Booking and Payment Readiness

Browser-calculated listing totals are estimates only. The backend must check
availability, create a short-lived hold or provisional booking reference, and
return a versioned quote with line items, currency, final payable total, and
expiry before checkout. The frontend must never send its calculated total as
the amount to charge.

A booking becomes confirmed only after the required approval path and verified
payment state are complete. Redirect parameters and client callbacks are not
payment proof. `PAID`, failure, reversal, and refund states come only from the
Pluto Booking API after verified provider processing or reconciliation.

Checkout is intentionally deferred until the backend supports idempotent
payment attempts, canonical status retrieval, duplicate-charge protection,
verified webhooks, reconciliation, dedicated refunds, safe error codes, and
durable notifications. XentriPay credentials and privileged payloads remain
server-side. See `docs/payment-readiness.md` for the full readiness gate,
customer state copy, error ownership, and email boundary.

## Partner Listing Workflow

Partner listing create/edit pages use a reusable wizard form.

Important rules:

- Cars do not require map location.
- Apartments, hotel rooms, and Airbnb stays require a place/location step.
- Listing option values come from the backend `GET /listing-options`.
- Images upload through the Cloudinary direct-upload signature and completion flow when possible.
- Submit flows display a non-dismissible progress dialog until success or failure.
- Listing updates should return to admin review where required.

## Favorites

Favorites are customer-only.

Important UX rules:

- Public listing cards show favorite buttons.
- Logged-out users see the login dialog before saving.
- After login, the intended favorite action should resume.
- Customer favorites page supports search, sorting, ordering, pagination, and deletion confirmation.
- Favorite cards should stay visually aligned with the homepage featured listing card style.

## Reviews

Reviews are listing-scoped and customer-only for creation.

Review categories:

- Cleanliness
- Accuracy
- Check-in
- Communication
- Location
- Value

Overall rating is calculated from the category ratings. Partners must not see or submit the customer review form.

## Design Rules

- Use Outfit as the primary font.
- Use `#02006c` as the primary brand color.
- Do not use gradient backgrounds.
- Use premium, restrained glassmorphism only where it improves the UI.
- Use CSS Modules for component-specific styling.
- Keep `globals.css` limited to design tokens, base styles, and reusable primitives.
- Every page must be responsive across desktop, laptop, tablet, and smartphone.
- Every page must include meaningful loading, success, error, and empty states.
- Loading states should use skeletons that match the final layout.
- Error and success messages must be user-facing and must not leak backend internals.

## Component Rules

- Shared app components belong in `src/components/shared`.
- shadcn/base UI components belong in `src/components/ui`.
- Auth components belong in `src/components/auth`.
- Customer account components belong in `src/components/account`.
- Partner workspace components belong in `src/components/partner`.
- Category listing components belong in:
  - `src/components/listings/cars`
  - `src/components/listings/apartments`
  - `src/components/listings/hotel-rooms`
  - `src/components/listings/airbnb`
- Prefer reusable components over duplicating layout sections.

## Form and Control Rules

- Inputs must use `src/components/ui/input.tsx`.
- Selects must use `src/components/ui/select.tsx`.
- Buttons must have icons, pointer cursor, accessible labels, and the shared button height.
- Submit buttons show only a loading icon while submitting and must be disabled.
- Phone fields should use country-code behavior like registration/profile forms.
- Error display should use the correct pattern:
  - Toast for temporary low-risk feedback.
  - Modal/dialog for blocking decisions.
  - Inline error beside the field or control that failed.

## SEO and Routing Rules

- Every page should define professional metadata and a useful title.
- Category detail pages should have category-specific titles.
- 403, 404, and 503 states should use the shared restricted/error-page visual language.
- Listing-not-found states should use the 404 design.

## Documentation Map

Additional rules live in `docs/`:

```txt
docs/api-endpoints.md
docs/component-structure.md
docs/design-system.md
docs/feedback-and-states.md
docs/git.md
docs/listing-categories.md
docs/payment-readiness.md
docs/seo.md
docs/styling.md
```

AI agents must read `AGENTS.md` before editing this project.

## Recommended Verification

Use targeted checks for focused changes:

```txt
TypeScript check:
npx tsc --noEmit --pretty false

Targeted ESLint:
npx eslint path/to/file.tsx

Whitespace check:
git diff --check -- path/to/file
```

Do not run full `npm run build` or full `npm run lint` automatically unless the user asks. Ask the user to run those commands for release readiness.

## Git Commit Message Rule

When reporting commit commands, use one professional commit message per file and keep paths relative to this project root.

Correct:

```bash
git add "src/components/listings/cars/car-listing-card.tsx"
git commit -m "style(listings): improve car listing card media layout"
```

Incorrect:

```bash
git add "app/app/src/components/listings/cars/car-listing-card.tsx"
git add "pluto/app/app/src/components/listings/cars/car-listing-card.tsx"
```
