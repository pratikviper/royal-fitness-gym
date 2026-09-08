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

## Biometric attendance (eSSL / ZKTeco)

The terminal pushes punches to the app; the app never dials the device. That
matters because the scanner sits on the gym LAN behind a router while the app
runs on Vercel — outbound calls need no port forwarding or static IP.

**Endpoints** (ADMS / "Push SDK" protocol, shapes dictated by the firmware):

| Route | Purpose |
| --- | --- |
| `GET  /api/iclock/<secret>/cdata` | Handshake — device asks how to behave |
| `POST /api/iclock/<secret>/cdata` | Attendance upload (tab-separated records) |
| `GET  /api/iclock/<secret>/getrequest` | Device polls for pending commands |
| `POST /api/iclock/<secret>/devicecmd` | Device reports a command result |

**Setup**

1. Set `BIOMETRIC_DEVICE_SERIALS` and `BIOMETRIC_INGEST_SECRET` (see
   `.env.example`). Both are required — an empty allowlist rejects everything.
2. On the device: **Menu → Comm → Ethernet / Cloud Server (ADMS)**, set the
   server address to your domain, port `443`, and enable HTTPS/domain mode.
3. Enrol the member's finger on the device and note the **User ID** it assigns.
4. Put that number in **Biometric Enrolment ID** on the member's profile in the
   admin console. This mapping is what links a punch to an account.

**How a punch becomes attendance:** each raw punch is stored in
`attendance_punches` under a deterministic id (`serial_user_timestamp`), which
makes replays idempotent — terminals resend their whole buffer on reconnect.
Matched punches then fold into `attendance/{uid}_{date}`, earliest becoming
`checkIn` and latest `checkOut`, so the existing attendance page needs no
changes. Staff can still mark attendance by hand; `source` distinguishes the two.

A punch whose enrolment number isn't mapped to anyone is **kept**, not dropped,
with `uid: null` — so enrolling on the device before linking the profile loses
nothing; fill in the ID and the history is already there.

`biometricId` is a staff-only field in `firestore.rules`: a member who could set
their own would collect another member's attendance.

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
