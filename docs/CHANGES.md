# Redesign + Next.js 16 migration

## To-do (all verified)

- [x] **Next.js 16, App Router.** The repo was *already* on the App Router (no `pages/`); the real migration was **Next 15.5 → 16.4.0** (React 19, Turbopack, flat ESLint config, `next lint` removed, `images.qualities`, `typedRoutes`, `allowedDevOrigins`). Clean production build, 8 static routes.
- [x] **Mobile nav → right-hand app drawer** from the hamburger, with **bounce in** (overshoots ~14px, settles) **and bounce out** (small anticipation, then exits). Measured frame-by-frame in Chromium. Focus-trapped, scroll-locked, Esc/close/link closes it, closes if the viewport grows to desktop.
- [x] **Layout and styling overhaul.** New type pairing (Young Serif + Figtree, self-hosted), brand-only palette from the logo, editorial layouts, shared section components.
- [x] **shadcn/ui components:** Button (new `cta` + `onDark` variants), Badge, Card, Separator, **Sheet**, **NavigationMenu**.
- [x] **Animations and micro-interactions:** hero crossfade + push-in, CSS entrance sequence, scroll reveals (on view, once), drawer bounce + staggered items, nav underline slide, button press, CTA arrow nudge, card lift, copy-to-clipboard icon swap, carousel progress bars, back-to-top progress ring. All respect `prefers-reduced-motion`.
- [x] **Back-to-top button** with a scroll-progress ring.
- [x] **`public/humans.txt`** with your details, served as `text/plain`, linked via `<link rel="author">`.
- [x] **Desktop navigation** properly scaled (72px header), active-page indicator, keyboard/aria support.
- [x] **Privacy Policy** (`/privacy`) and **Terms of Service** (`/terms`), with contents sidebar, anchors, Nigerian-law framing (NDPA 2023).
- [x] **Hero = image-background carousel** under the site-colour (green) gradient; autoplay with a pause button.
- [x] **All CTAs use the secondary colour** (logo purple), via `variant="cta"`.
- [x] **All styling via tokens in `globals.css`**, enforced by a test.
- [x] **This to-do list.**

## Verification

| Check | Result |
| --- | --- |
| `pnpm build` (Next 16.4.0, Turbopack) | pass |
| `tsc` (with `typedRoutes`) | pass |
| ESLint (flat config) | 0 errors |
| Biome | 0 errors |
| Unit + component tests (Vitest) | **134 pass** |
| Browser tests (Playwright, desktop + mobile Chromium) | **79 pass**, 0 fail |
| Mutation check: 9 original bugs re-introduced | **9/9 caught** by the suite |

## What was actually wrong (measured on the original code)

| Problem | Evidence | Fix |
| --- | --- |
| Fixed header **160px (desktop) / 192px (mobile)** tall, but `<main>` reserved only 64px, so the header covered 96-128px of every page | Playwright measurements | Sticky 72px header (`--header-h`); content starts exactly beneath it (tested) |
| Logo breakpoints inverted: **160px on phones, 80px on tablets** | CSS classes + measurement | Single sized `<Logo>` |
| Home page scrolled sideways on a 360px phone (481px wide) | `scrollWidth` | No horizontal overflow on any page at 360px (tested) |
| Literal `&#39;` rendered on the home page | page text | Real apostrophes; test scans all pages |
| Projects: empty "Impact:" label | page text | Rendered only when there's a value |
| `/privacy` and `/terms` linked from the footer but **404** | HTTP status | Pages built; `typedRoutes` + a test make dead links a compile/test error |
| 9 CTA `<Button>`s with no link or handler | source | All wired (links, `mailto:`, `tel:`) |
| Contact details conflicted (constants vs contact page; `+234-XXX-XXX-XXXX` placeholder) | source | One source of truth in `lib/constants.ts` |
| Whole page was `opacity:0` in SSR HTML until hydration; below-fold animations finished before anyone scrolled | source | Reveals trigger on view; hero uses CSS-only entrance; `<noscript>` fallback |
| Every page was `'use client'`, so no per-page `metadata` was possible | source | Pages are server components with their own titles/descriptions |
| Nav re-rendered on every scroll event | source | `useSyncExternalStore` boolean; re-renders only when it flips |
| Logo was a 226KB SVG wrapping a raster | file size | 21KB transparent PNG |
| Palette was green + blue + yellow; the logo is **green + purple** | logo sampled | Brand-only palette |
| `<a><button>` nesting in the nav; no `aria-current`; no keyboard/scroll-lock on mobile menu | source | Radix primitives |
| Attached Vercel build log | `next lint` passes on current code | The log is from an older commit; ignore it |

## Decisions you may want to override

1. **"Secondary colour" = the logo's purple.** shadcn's default `--secondary` is a neutral grey, and the old site used blue and yellow, which aren't in the logo. To change every CTA at once, edit `--secondary` / `--secondary-hover`.
2. **Hero images are generated placeholder illustrations** (I had no photos). Swap them via `HERO_SLIDES`; see the README.
3. **Contact details:** I used the contact page's values (`info@daramanihot.com.ng`, both phone numbers, Ketu, Lagos) over the conflicting constants. Please confirm.
4. **Legal pages are drafts**, written to match what the site actually does (no cookies/analytics, no forms; NDPA 2023, NDPC, Lagos courts). Have a Nigerian lawyer review them; they don't state a company registration number or a named data-protection officer.
5. **`humans.txt` is public** and includes your work email, so edit it if you'd rather not publish that.
6. **Removed the wildcard `Access-Control-Allow-Origin: *`** header (it applied to every route in production) and replaced it with `allowedDevOrigins` for the Replit preview.
7. **Contact page** no longer repeats a second CTA band (the "Ready to start?" card is the CTA).
8. Previously dead "Learn More" buttons on Projects now open an email enquiry about that project.

## Still needs your attention

- **Placeholder team on `/projects`** ("Dr. Agricultural Expert", "Eng. Energy Systems"...) was in the original; replace before launch.
- Social URLs in `lib/constants.ts` are unverified guesses from the original code.
- Stats ("500+ farmers", "50+ projects"...) are the original's claims; confirm they're accurate.

## Files

**Deleted (superseded):** `components/navigation.tsx`, `components/sections/hero.tsx` (unused), `hooks/use-scroll-position.ts`.
**Left in place but now unused:** `public/logo1.svg` and the `create-next-app` SVGs (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`): safe to delete.
**Dependencies:** `lucide-react` and `motion` intentionally kept on their existing majors (lucide 1.x removes the brand icons the footer uses). Replace your lockfile by running `pnpm install`.
