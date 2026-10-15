# Dara-Manihot Industries & Farms

Marketing site for Dara-Manihot Industries & Farms: sustainable agriculture,
renewable energy, biomass gasification and green hydrogen in Nigeria.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS 4 ·
shadcn/ui + Radix · Motion · TypeScript · Biome + ESLint · Vitest + Playwright.

## Getting started

Requires Node.js **20.9+** (a Next.js 16 requirement).

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `pnpm dev` / `build` / `start` | Next.js dev server, production build, serve the build |
| `pnpm lint` | ESLint (Next 16 removed `next lint`, so this is the plain ESLint CLI) |
| `pnpm format` | Biome: format + organise imports + safe fixes |
| `pnpm typecheck` | Generates typed-route definitions, then `tsc --noEmit` |
| `pnpm test` | Unit/component tests (Vitest + Testing Library) |
| `pnpm test:e2e` | Browser tests (Playwright). Needs a build first; first run: `pnpm exec playwright install chromium` |
| `pnpm check` | lint + typecheck + unit tests |
| `pnpm launch:check` | Lists everything still blocking a production launch (missing SMTP settings, placeholder team, photos). Exits 1 on blockers |
| `pnpm webmail:provision` | Creates the five business mailboxes through cPanel. Dry run unless given `-- --apply`. See `docs/EMAIL-SETUP.md` |

> Next 16 no longer lints during `next build`. Run `pnpm check` in CI.

## Environment

The enquiry form needs SMTP settings to send email. Copy `.env.example` to
`.env.local` and fill it in; production sets the same variables in the host's
environment. Without them the form shows a friendly error and nothing is lost
silently. Full guide: [`docs/EMAIL-SETUP.md`](docs/EMAIL-SETUP.md).

## Project structure

```
app/
  layout.tsx            fonts, metadata, header/footer, skip link, back-to-top
  globals.css           ALL design tokens (see below)
  page.tsx              home
  (pages)/              about, services, projects, contact, privacy, terms
  fonts/                self-hosted Young Serif + Figtree (woff2)
components/
  ui/                   shadcn/ui primitives (button, badge, card, sheet, navigation-menu, separator)
  sections/             page-level building blocks (home-hero, page-hero, section-heading, cta-band, legal-document)
  site-header.tsx       sticky header + desktop navigation
  mobile-nav.tsx        right-hand app drawer (bounce in/out)
  hero-carousel.tsx     background image carousel
  back-to-top.tsx, copy-button.tsx, animations.tsx, footer.tsx, logo.tsx
lib/
  constants.ts          company info, nav, hero slides: the single source of truth
  services.ts, legal.ts content for the services and the Privacy/Terms pages
tests/                  unit + component tests
e2e/                    Playwright tests
public/                 logo.png, hero images, humans.txt
```

## Design tokens

Everything visual is defined in **`app/globals.css`**; components never use a
raw colour. A test (`tests/design-tokens.test.ts`) fails the build if a
component uses a Tailwind palette class (`bg-green-600`) or a hex/rgb value.

* **Palette** is sampled from the logo: leaf green (`--primary`) and wordmark
  purple (`--secondary`).
* **Every call-to-action is the secondary colour**: use
  `<Button variant="cta">`. To re-colour all CTAs, change `--secondary`
  (and `--secondary-hover`).
* **Gradients**: `--hero-gradient` (laid over the carousel), `--band-gradient`,
  `--page-hero-gradient`.
* **Type**: `font-display` (Young Serif, headings) and `font-sans` (Figtree).
  Fluid sizes: `text-display`, `text-title`, `text-lead`.
* **Layout**: `--header-h`, `--container-max`, `--section-y`; utilities
  `page-container`, `section-y`, `scroll-mt-header`.
* **Motion**: `--ease-bounce`, drawer and hero durations, keyframes. Contrast
  of the key colour pairs is asserted at WCAG AA in the token test.

## Common tasks

**Replace the hero images.** Put your photos in `public/images/hero/` and edit
`HERO_SLIDES` in `lib/constants.ts` (path, alt text, caption, and an optional
`position` to tune the crop). Keep the subject near the horizontal centre:
phones show only the middle third. The four images shipped are placeholder
illustrations.

**Add the client's photos.** Every image on the site is a named slot in
`lib/imagery.ts`. Drop a file in `public/images/`, set the slot's `src` and
`alt`. The full shot list for the client is in
[`docs/PHOTO-REQUEST.md`](docs/PHOTO-REQUEST.md).

**Add or change a service.** Edit `SERVICES` in `lib/services.ts` and give it a
`pillar` (`sustainable-agriculture`, `sustainable-energy` or `supporting`). It
then appears in the right Services section, the enquiry form's service list
and the footer, with no other change.

**Replace the placeholder team.** Edit `lib/team.ts`, set `placeholder: false`.

**Update contact details.** Edit `COMPANY_INFO` in `lib/constants.ts`. The
header, footer, contact page and legal pages all read from it.

**Update legal text.** Edit `lib/legal.ts` and bump `LEGAL_LAST_UPDATED` in
`lib/constants.ts`.

**Add a page.** Create `app/(pages)/<name>/page.tsx` with a `metadata` export,
add it to `NAVIGATION_LINKS`, and (for the mobile drawer) an icon in
`components/mobile-nav.tsx`. TypeScript flags the missing icon, and
`typedRoutes` flags any link to a route that doesn't exist.

## Accessibility and motion

Skip link, visible focus rings, `aria-current` on the active page, a focus-
trapped dialog for the drawer, a pause button on the carousel, and
`prefers-reduced-motion` support everywhere (no autoplay, no push-in, no
bounce). Scroll reveals fall back to visible content when JS is off.
