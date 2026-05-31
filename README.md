# PLUTO Web App

PLUTO Web App is the public-facing marketplace application for the PLUTO travel platform.

This application is used by:

* Public visitors
* Customers
* Partners

It allows users to browse and book cars, apartments, hotel rooms, and Airbnb-style houses. It also allows approved partners to manage their listings, bookings, and business activities.

Admin and superadmin features must not be built inside this application. Admin features belong in the separate PLUTO Admin App located at:

```txt
pluto/app/admin
```

---

# 1. Project Identity

```txt
Project Name: PLUTO Web App
Project Type: Public Marketplace + Customer Dashboard + Partner Dashboard
Framework: Next.js
Language: TypeScript
Package Manager: npm
Default Port: 3000
Backend API: PLUTO NestJS API
```

Recommended local URL:

```txt
http://localhost:3000
```

---

# 2. Main Purpose

This app handles the customer and partner side of PLUTO.

It must support:

* Public product browsing
* Product search and filtering
* Product details
* Customer registration
* Customer login
* Google login
* Partner registration
* Customer dashboard
* Partner dashboard
* Booking creation
* Booking tracking
* Booking history
* Payment flow
* Profile management
* Partner product submission
* Partner product status tracking
* Partner booking management
* Google Cloud Storage upload flow through backend signed URLs

---

# 3. What Must Not Be Built Here

Do not build these features in this app:

* Admin dashboard
* Superadmin dashboard
* Partner approval management
* Product approval management
* Audit log management
* Global payment supervision
* User role management
* Admin creation
* Platform-wide settings
* Security event monitoring

Those features belong in:

```txt
pluto/app/admin
```

---

# 4. Technology Stack

This app uses:

```txt
Next.js
TypeScript
Tailwind CSS
shadcn/ui
TanStack Query
React Hook Form
Zod
Axios
Framer Motion
Lucide React
Next Themes
Sonner
date-fns
Embla Carousel
React Day Picker
```

Purpose of each major tool:

```txt
Next.js              -> Web framework, routing, SEO, server/client rendering
TypeScript           -> Type safety and clean development
Tailwind CSS         -> Styling system
shadcn/ui            -> Professional reusable UI components
TanStack Query       -> API data fetching, caching, loading, refetching
React Hook Form      -> Form state management
Zod                  -> Schema validation
Axios                -> API client
Framer Motion        -> Smooth animations
Lucide React         -> Icons
Next Themes          -> Theme handling
Sonner               -> Toast notifications
date-fns             -> Date formatting and date calculations
Embla Carousel       -> Product image sliders
React Day Picker     -> Booking date selection
```

---

# 5. Installation

From the project folder:

```bash
cd pluto/app/app
npm install
```

Run development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run production build:

```bash
npm run start
```

---

# 6. Environment Variables

Create:

```txt
.env.local
```

from:

```txt
.env.example
```

Required environment variables:

```env
NEXT_PUBLIC_APP_NAME="PLUTO"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=""

NEXT_PUBLIC_ENABLE_PARTNER_REGISTRATION=true
NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN=true
```

Rules:

* Never commit `.env.local`.
* Never expose backend secrets in frontend environment variables.
* Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.
* Do not place JWT secrets, SMTP credentials, database URLs, or cloud storage private keys in this app.

Form UI rules:

* Every input must use `src/components/ui/input.tsx`.
* Every input must include a visible leading icon.
* Inputs, select triggers, and buttons must share the same height as the login input.
* Select triggers must use `src/components/ui/select.tsx`.
* Every button must include an icon.

---

# 7. Recommended Folder Structure

```txt
pluto/app/app/
  src/
    app/
      layout.tsx
      page.tsx
      globals.css

      (public)/
        cars/
        apartments/
        hotels/
        airbnb/
        search/
        about/
        contact/

      (auth)/
        login/
        register/
        partner-register/
        complete-profile/
        forgot-password/
        reset-password/

      (customer)/
        dashboard/
          bookings/
          booking-history/
          payments/
          favorites/
          reviews/
          profile/
          security/

      (partner)/
        partner/
          dashboard/
          products/
          products/new/car/
          products/new/apartment/
          products/new/hotel-room/
          products/new/airbnb-house/
          bookings/
          earnings/
          verification/
          profile/

    components/
      ui/
      common/
      layout/
      forms/
      products/
      bookings/
      dashboard/
      partner/
      auth/
      upload/
      empty-states/
      loaders/

    config/
      app.config.ts
      routes.config.ts

    constants/
      roles.ts
      product-categories.ts
      query-keys.ts

    features/
      auth/
      products/
      bookings/
      payments/
      partner/
      profile/
      storage/

    hooks/
      use-current-user.ts
      use-auth.ts
      use-debounce.ts

    lib/
      utils.ts
      formatters.ts
      validators.ts

    providers/
      app-providers.tsx
      query-provider.tsx
      theme-provider.tsx

    services/
      api/
        client.ts
      auth/
      products/
      bookings/
      payments/
      partner/
      storage/

    types/
      auth.ts
      user.ts
      product.ts
      booking.ts
      payment.ts
      api.ts
```

---

# 8. Route Structure

Public routes:

```txt
/
 /cars
 /cars/[id]
 /apartments
 /apartments/[id]
 /hotels
 /hotels/[id]
 /airbnb
 /airbnb/[id]
 /search
 /about
 /contact
```

Auth routes:

```txt
/login
/register
/partner-register
/complete-profile
/forgot-password
/reset-password
```

Customer dashboard routes:

```txt
/dashboard
/dashboard/bookings
/dashboard/booking-history
/dashboard/payments
/dashboard/favorites
/dashboard/reviews
/dashboard/profile
/dashboard/security
```

Partner dashboard routes:

```txt
/partner
/partner/dashboard
/partner/products
/partner/products/new/car
/partner/products/new/apartment
/partner/products/new/hotel-room
/partner/products/new/airbnb-house
/partner/bookings
/partner/earnings
/partner/verification
/partner/profile
```

---

# 9. Backend Integration

The app connects to:

```txt
NEXT_PUBLIC_API_URL
```

Default local API:

```txt
http://localhost:4000/api/v1
```

The shared API client must be:

```txt
src/services/api/client.ts
```

All requests must go through services.

Good:

```txt
src/services/auth
src/services/products
src/services/bookings
src/services/payments
src/services/storage
src/services/partner
```

Bad:

```txt
Calling axios directly inside page components
Calling fetch randomly from different components
Duplicating API base URLs across files
```

---

# 10. API Endpoint Groups Used by This App

Public/customer endpoints:

```txt
GET    /api/v1/products
GET    /api/v1/products/:id
GET    /api/v1/cars
GET    /api/v1/cars/:id
GET    /api/v1/apartments
GET    /api/v1/apartments/:id
GET    /api/v1/hotel-rooms
GET    /api/v1/hotel-rooms/:id
GET    /api/v1/airbnb-houses
GET    /api/v1/airbnb-houses/:id

POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/auth/google
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh

GET    /api/v1/me/profile
PATCH  /api/v1/me/profile
GET    /api/v1/me/bookings
GET    /api/v1/me/payments

POST   /api/v1/bookings
GET    /api/v1/bookings/:id
POST   /api/v1/payments/initiate
```

Partner endpoints:

```txt
POST   /api/v1/auth/register-partner

GET    /api/v1/partner/dashboard
GET    /api/v1/partner/profile
PATCH  /api/v1/partner/profile

GET    /api/v1/partner/products
POST   /api/v1/partner/products/cars
POST   /api/v1/partner/products/apartments
POST   /api/v1/partner/products/hotel-rooms
POST   /api/v1/partner/products/airbnb-houses
PATCH  /api/v1/partner/products/:id
DELETE /api/v1/partner/products/:id

GET    /api/v1/partner/bookings
GET    /api/v1/partner/earnings
```

Storage endpoints:

```txt
POST   /api/v1/storage/signed-upload-url
POST   /api/v1/storage/confirm-upload
```

This app must not use admin endpoints like:

```txt
/api/v1/admin/...
```

---

# 11. Authentication Rules

The app supports:

* Email/password login
* Google login
* Customer registration
* Partner registration
* Complete profile flow after Google login
* Password setup after Google login
* Logout
* Session refresh

Rules:

* If Google account lacks phone number, redirect user to complete profile form.
* If Google registration lacks required fields, do not allow full dashboard access until profile is complete.
* Password can be set after Google login.
* Admin and superadmin users should be redirected to the admin app.
* Pending partners should be sent to `/partner/verification`.
* Approved partners should access `/partner/dashboard`.
* Suspended users must be blocked.

Recommended post-login redirect logic:

```txt
CUSTOMER              -> /dashboard
PARTNER pending       -> /partner/verification
PARTNER approved      -> /partner/dashboard
ADMIN                 -> redirect to admin app
SUPERADMIN            -> redirect to admin app
SUSPENDED             -> show account suspended page
```

---

# 12. Role Rules

Supported roles:

```txt
CUSTOMER
PARTNER
ADMIN
SUPERADMIN
```

This app should mainly support:

```txt
CUSTOMER
PARTNER
```

ADMIN and SUPERADMIN should be redirected to:

```txt
NEXT_PUBLIC_ADMIN_APP_URL
```

Never rely only on frontend role checks. Backend must enforce all role and ownership rules.

---

# 13. Product Category Rules

PLUTO supports:

```txt
CAR
APARTMENT
HOTEL_ROOM
AIRBNB_HOUSE
```

Each category must have its own form.

Do not create one messy product form with every input mixed together.

Car form fields should include:

```txt
Brand
Model
Year
Transmission
Fuel type
Seats
Doors
Luggage capacity
Driver included
Insurance included
Mileage limit
Deposit requirement
Images
Location
Price
Availability
```

Apartment form fields should include:

```txt
Bedrooms
Bathrooms
Kitchen
Living room
Furnished
Wifi
Parking
Floor number
Max guests
Images
Location
Price
Availability
```

Hotel room form fields should include:

```txt
Hotel name
Room type
Bed type
Room size
Breakfast included
Check-in time
Check-out time
Max guests
Images
Location
Price
Availability
```

Airbnb house form fields should include:

```txt
House type
Entire place
Self check-in
House rules
Cleaning fee
Bedrooms
Bathrooms
Max guests
Pets allowed
Smoking allowed
Parties allowed
Images
Location
Price
Availability
```

---

# 14. Product Display Rules

Public users must only see products where:

```txt
status = APPROVED
visibility = PUBLIC
isAvailable = true
```

Never display:

```txt
Pending products
Rejected products
Suspended products
Private products
Admin notes
Rejection reasons
Partner private documents
```

Product cards should show:

```txt
Cover image
Title
City
Price
Pricing unit
Category-specific highlights
Rating
Favorite button
View details button
Book button
```

Product details pages should show:

```txt
Image gallery
Title
Location
Description
Amenities
Category-specific details
Availability
Reviews
Booking panel
Partner public information
Similar products
```

---

# 15. Booking Flow

Booking must be simple and step-based.

Recommended flow:

```txt
Step 1: Select dates
Step 2: Confirm guests or rental details
Step 3: Review booking summary
Step 4: Initiate payment
Step 5: Show confirmation
```

Booking pages must show:

```txt
Product name
Product image
Dates
Number of nights/days
Guests or rental quantity
Subtotal
Service fee
Taxes
Discount
Total
Payment status
Booking status
```

Do not let users create bookings for unavailable dates.

Do not trust frontend price calculations. The backend must calculate final price.

---

# 16. Payment Flow Rules

Payment must be initiated from the backend.

The frontend may collect:

```txt
Payment provider
Phone number for mobile money
Card redirect choice, if supported
Booking ID
```

The frontend must not mark payments as paid.

Only backend webhook verification can confirm payment.

Payment statuses:

```txt
PENDING
PROCESSING
PAID
FAILED
CANCELLED
REFUNDED
PARTIALLY_REFUNDED
```

---

# 17. Google Cloud Storage Upload Flow

This app must not upload files directly to the backend as base64.

Use signed upload URL flow:

```txt
1. User selects file
2. Frontend validates file type and size
3. Frontend requests signed upload URL from backend
4. Frontend uploads file directly to Google Cloud Storage
5. Frontend confirms upload to backend
6. Backend saves FileAsset record
7. Product/profile/document stores file reference
```

Allowed public files:

```txt
Product images
Public profile images
```

Private files:

```txt
Partner verification documents
Booking attachments
Payment receipts
Admin documents
```

Frontend validation must match backend validation.

Recommended limits:

```txt
Images: JPG, PNG, WEBP up to 5MB
Documents: PDF up to 10MB
```

---

# 18. State Management Rules

Use TanStack Query for server state:

```txt
Products
Bookings
Payments
Profile
Partner products
Partner dashboard
```

Use local component state for UI state:

```txt
Modals
Tabs
Dropdowns
Form steps
Temporary selections
```

Do not create unnecessary global state.

Use query keys from:

```txt
src/constants/query-keys.ts
```

Example:

```ts
export const queryKeys = {
  products: ['products'],
  product: (id: string) => ['products', id],
  myBookings: ['me', 'bookings'],
  partnerProducts: ['partner', 'products'],
};
```

---

# 19. Form Rules

Use:

```txt
React Hook Form
Zod
shadcn/ui form components
```

Every form must have:

```txt
Client-side validation
Backend error display
Loading state
Disabled submit during request
Success feedback
Error feedback
Accessible labels
```

Do not submit invalid data to backend.

Do not hide backend errors.

---

# 20. UI/UX Rules

The PLUTO Web App should feel:

```txt
Premium
Fast
Clean
Trustworthy
Modern
Easy to use
Mobile-first
```

Use:

```txt
Clear spacing
Large product images
Smooth animations
Skeleton loading
Professional empty states
Clear error states
Sticky booking summary
Bottom mobile booking bar
Simple filters
Step-based forms
Clear partner status messages
```

Avoid:

```txt
Crowded pages
Too many colors
Long forms without steps
Tiny buttons
Unclear booking totals
Hidden errors
Unoptimized images
Slow animations
```

---

# 21. Animation Rules

Use Framer Motion carefully.

Good animations:

```txt
Page section entrance
Product card hover
Modal opening
Form step transition
Dashboard card reveal
Loading skeletons
```

Avoid:

```txt
Animations that delay booking
Animations that make dashboard slow
Too many moving elements
Animations on large lists
```

Animations must improve clarity, not distract.

---

# 22. Performance Rules

Required:

```txt
Use pagination
Use lazy loading
Use image optimization
Use skeleton loading
Use debounced filters
Use server components for public SEO pages where useful
Use TanStack Query caching
Avoid unnecessary rerenders
Avoid large client bundles
```

Product listing must use pagination:

```txt
GET /api/v1/products?page=1&limit=12&category=CAR&city=Kigali
```

Never fetch all products at once.

---

# 23. SEO Rules

Public marketplace pages must be SEO-friendly.

Important pages:

```txt
/
 /cars
 /apartments
 /hotels
 /airbnb
 /products/[id]
```

Each product details page should have:

```txt
Dynamic title
Dynamic description
Open Graph image
Canonical URL
Structured metadata where possible
```

Example title:

```txt
Toyota RAV4 2021 for Rent in Kigali | PLUTO
```

---

# 24. Error Handling Rules

Every API error must be handled.

Show:

```txt
Clear message
Retry option where useful
Fallback state
Toast notification for actions
Inline errors for forms
```

Do not show raw technical errors to users.

Bad:

```txt
PrismaClientKnownRequestError
500 Internal Server Error
```

Good:

```txt
We could not complete your booking. Please try again.
```

---

# 25. Security Rules

This app must follow these rules:

```txt
Do not store secrets in frontend
Do not trust frontend role checks
Do not expose admin endpoints
Do not expose private file keys unnecessarily
Do not store long-lived tokens in localStorage
Do not allow partner routes to normal customers
Do not show rejected products publicly
Do not show pending products publicly
Do not calculate final price only on frontend
Do not mark payment as paid from frontend
```

Frontend guards are for UX only. Backend guards are the real protection.

---

# 26. Accessibility Rules

Every page must be usable with:

```txt
Keyboard navigation
Screen readers
Clear focus states
Labels on inputs
Proper button text
Readable contrast
Descriptive image alt text
```

Product images should include meaningful `altText`.

---

# 27. Loading and Empty State Rules

Every page that fetches data must include:

```txt
Loading state
Empty state
Error state
Success state
```

Examples:

```txt
No cars found in Kigali.
No bookings yet.
Your partner account is still under review.
This product is waiting for admin approval.
```

---

# 28. Git Rules

Do not commit:

```txt
.env.local
node_modules
.next
logs
temporary files
private keys
```

Recommended commits:

```bash
git add .
git commit -m "Create PLUTO public web app foundation"

git add .
git commit -m "Add PLUTO marketplace landing page"

git add .
git commit -m "Add customer booking dashboard"

git add .
git commit -m "Add partner product creation flow"

git add .
git commit -m "Add Google Cloud Storage upload flow to PLUTO web app"
```

---

# 29. Development Checklist

Before pushing code:

```txt
npm run lint
npm run build
```

Check:

```txt
No TypeScript errors
No unused imports
No broken routes
No exposed secrets
No direct admin API calls
No unprotected partner pages
No missing loading states
No missing form validation
No broken responsive layout
```

---

# 30. Final Rule

This app must remain focused on:

```txt
Public marketplace
Customer experience
Partner experience
Booking and payment flow
```

Do not mix admin operations into this project.

PLUTO Web App must be clean, fast, mobile-friendly, secure, and easy for normal users and partners.
