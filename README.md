# Royal Fitness — Premium Gym Website

An Awwwards-caliber, production-ready luxury fitness website built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Three.js / React Three Fiber**, **Framer Motion**, **GSAP**, **Lenis**, **Tailwind CSS** and **shadcn/ui**.

> Brand: **Black** (primary) · **Metallic Silver** (secondary) · **Royal Red** (accent). Headings in **Bebas Neue**, body in **Inter**.

## Getting Started

This project uses **Yarn** (PnP) — `yarn.lock` is the source of truth.

```bash
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy `.env.example` → `.env.local` and fill in the values.

## Access control

Two boundaries protect member data, and both must be in place:

1. **Firestore security rules** (`firestore.rules`) govern everything the
   browser does. They are not active until you publish them:

   ```bash
   firebase deploy --only firestore:rules
   ```

   `isAdmin()` there matches the bootstrap address exactly, or `role: "admin"`
   on the caller's user document. `lib/admin.ts` mirrors this for the UI —
   change one and you must change the other, including `NEXT_PUBLIC_ADMIN_EMAIL`.
   A member cannot write `role` to their own document, by rule.

2. **`/api/admin/*` route handlers** use the Firebase Admin SDK, which bypasses
   the rules entirely — so each route authorises the caller itself via
   `requireAdmin()`. They need `FIREBASE_SERVICE_ACCOUNT` (see `.env.example`).
   Without it the routes return 503 and the rest of the app is unaffected.

   These routes exist because the client SDK cannot manage other people's
   accounts: creating one would hijack the admin's own session, and deleting a
   member's documents leaves their login working. Creating and deleting members
   from the admin console therefore requires a Node runtime — a static export
   will not serve them.

   **Never** expose the service account to the browser. It is read only from
   `lib/server/*`, which is `server-only`-guarded so a stray client import
   fails the build.

## Scripts

| Command | Description |
| --- | --- |
| `yarn dev` | Start the dev server |
| `yarn build` | Production build |
| `yarn start` | Serve the production build |
| `yarn lint` | ESLint |
| `yarn typecheck` | Type-check with `tsc` |

## Project Structure

```
app/            App Router pages (home, about, membership, trainers, gallery, contact, 404) + SEO (sitemap, robots)
components/     Reusable UI — ui/ (shadcn), navbar/, footer/, hero/, three/, trainer/, membership/, gallery/,
               testimonial/, forms/, shared/
sections/      Composed home-page sections
hooks/         Client hooks (Lenis, media query, scroll)
lib/           Utilities, fonts, SEO, validations (Zod), BMI logic, constants
data/          Content: memberships, trainers, testimonials, facilities, gallery, navigation, site
types/         Shared TypeScript types
public/        Static assets (logo.svg, trainer/gallery placeholders)
```

## Three.js Hero

`components/three/` contains the immersive hero scene: floating **metallic dumbbells**, drifting **particles**, moving **spotlights**, **soft fog**, contact-shadow grounding, an HDRI **Environment** for realistic metal reflections, and a **mouse-driven camera rig**. It is `dynamic`-imported with `ssr: false` and uses **adaptive DPR** + a **PerformanceMonitor** to hold 60 FPS.

## Customizing

- **Logo**: replace `public/logo.svg` (a crown wordmark placeholder derived from the brief).
- **Trainer images**: drop photos in `public/trainers/` and update `data/trainers.ts`.
- **Gallery images**: swap the Unsplash URLs in `data/gallery.ts` with your own `/public` assets.
- **Colors/typography**: design tokens live in `app/globals.css` (CSS variables) and `tailwind.config.ts`.

## Future-Ready Integrations

Data and forms are structured for easy backend wiring:

- **Auth / DB**: Firebase, Supabase, MongoDB, PostgreSQL — data layer is isolated in `data/`.
- **Payments**: Razorpay / Stripe — hook into the membership "Choose plan" CTAs.
- **Contact / Newsletter**: wired — submissions persist to `contact_enquiries` / `newsletter_subscribers` via `lib/enquiries.ts` and surface in the admin Enquiries console. Add email delivery on top if you want notifications.
- **Booking / Attendance / Admin**: the component + type structure supports adding member/trainer flows without refactors.

## Accessibility & SEO

Semantic HTML, ARIA labels, visible focus states, keyboard-navigable lightbox and menus, reduced-motion support, per-page metadata, OpenGraph/Twitter cards, `sitemap.xml`, `robots.txt`, and JSON-LD structured data (`HealthClub`).
