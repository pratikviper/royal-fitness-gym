# Royal Fitness — Premium Gym Website

An Awwwards-caliber, production-ready luxury fitness website built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Three.js / React Three Fiber**, **Framer Motion**, **GSAP**, **Lenis**, **Tailwind CSS** and **shadcn/ui**.

> Brand: **Black** (primary) · **Metallic Silver** (secondary) · **Royal Red** (accent). Headings in **Bebas Neue**, body in **Inter**.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy `.env.example` → `.env.local` and fill values as you wire up integrations.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Type-check with `tsc` |

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
- **Contact / Newsletter**: forms validate with Zod and expose a single `onSubmit` — point it at a route handler or server action.
- **Booking / Attendance / Admin**: the component + type structure supports adding member/trainer flows without refactors.

## Accessibility & SEO

Semantic HTML, ARIA labels, visible focus states, keyboard-navigable lightbox and menus, reduced-motion support, per-page metadata, OpenGraph/Twitter cards, `sitemap.xml`, `robots.txt`, and JSON-LD structured data (`HealthClub`).
