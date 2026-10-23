# Enquiry dropdown, "Who we are" type and tile hover

## To-do (all verified)

- [x] **Service dropdown.** On desktop the "Service of interest" field is now a styled listbox (`DropdownSelect`, `components/ui/dropdown-select.tsx`) instead of the browser's own list, which could not be themed and clashed with the dark enquiry card. It unfolds from the field, is grouped by pillar, ticks the chosen row, and opens on the side with more room, never taller than that room. Colours are the popover and accent tokens, so it stays light on the dark card.
- [x] **Phones keep the native picker.** The scope asks for a form that is easy to complete on mobile (4.4), and a phone's own picker is easier than any custom list. `DropdownSelect` renders the native `<select>` unless the device has a hovering, precise pointer (`hooks/use-fine-pointer.ts`). Both report the same value and both carry `id="enquiry-service"`, so labels, error focus and the form's state work the same either way.
- [x] **Keyboard and screen readers.** WAI-ARIA select-only combobox: Arrow keys, Home, End, Enter, Space, Escape, Alt+ArrowUp and type-ahead. Focus stays on the button and the highlighted row is announced through `aria-activedescendant`. Tab closes the list without changing the value. Reduced motion gets a plain fade.
- [x] **"Who we are" type.** The label is now bold (24px, 30px from `sm`) and the company statement uses a new fluid `text-intro` token (22px on phones up to 30px) in semibold. Contrast on mint is still AA (the purple label is 5.6:1).
- [x] **Tile hover.** Each of the five tiles lifts 4px and casts the site's `shadow-float` on hover. Hover-capable devices only; reduced motion gets no movement. Tailwind v4 lifts with the CSS `translate` property, so that is what the transition names (naming `transform` would make the lift snap).

## Notes for review

- **Behaviour change:** on desktop, choosing a service is a click or key press on a custom list. The first empty "Select a service" row is no longer a choosable option there (the field is required, so there is nothing to clear to). The native picker on phones still has it.
- **Tests:** `tests/dropdown-select.test.tsx` (new), more cases in `tests/enquiry-form.test.tsx`, `tests/site-changes.test.tsx` and `tests/design-tokens.test.ts`. `e2e/helpers.ts` gained `chooseService` and `selectedService`, which work with either control; use them instead of `selectOption` for the service field. `vitest.setup.ts` can now simulate a mouse with `window.__finePointer = true` (the default is a touch device).
- The dropdown's unfold is inspired by beUI's Select. It is a small purpose built component rather than a copy, because beUI's depends on helper hooks this site does not have and on a search box a 7 option list does not need.

---

# Heroes and cookie consent

## To-do (all verified)

- [x] **Landing hero.** The colour gradient over the carousel is gone. Text legibility now comes from the `text-on-photo` token shadow.
- [x] **Page heroes.** About, Services (and each service page), Projects, Privacy and Terms now have a photo behind a translucent green overlay (`bg-page-hero-overlay`). Contact keeps the plain gradient. Photos are chosen in `PAGE_HERO_IMAGES`.
- [x] **Cookie popup.** `CookieBanner` (Accept and Decline equally prominent, non-modal) and a footer "Cookie settings" button to change the choice. The choice is kept in localStorage for 12 months, never as a cookie, and never sent anywhere.
- [x] **Map.** Loads by itself once cookies are accepted, with no "Load interactive map" click. Declined or undecided shows the address placeholder and the directions links.
- [x] **Privacy Policy and Terms.** Cookies section rewritten for the consent flow; Terms updated for the Google map and consent. `LEGAL_LAST_UPDATED` is 21 October 2026.

## Notes for review

- **12 months** appears in `CONSENT_MAX_AGE_MS` and in the Privacy Policy. Change both together.
- **Existing visitors** are asked once, since nothing was stored before.
- **Legal wording** is a good faith update, not legal advice; have a Nigerian lawyer (NDPA 2023) confirm it.
- The earlier "Map loads on click" note below is superseded by this change.

---

# Wireframe pass 2: sections, projects, footer, map, menu

Implements the second set of wireframes. No new colours: `mint` is the one new
token (the logo green at 200), plus a `statement` type size. Email code, the
enquiry form and the API route were not touched.

## To-do (all verified)

- [x] **Counting figures.** `CountUp` (with `lib/figure.ts`) counts from 0 to the real figure when it scrolls into view: stats band, About stats and the project impact figure ("30%"). The real text is in the markup from the start (SSR, no-JS, screen readers hear it once); only the visible copy animates; reduced motion shows the final value. Years in the timeline and step numbers are not counted on purpose.
- [x] **Vision (images 2 and 5).** `VisionStatement`: one large centred display-type statement on the page background, "Our vision" beneath it. Replaces the dark band.
- [x] **Who we are (image 6).** `WhoWeAre`: mint section, label, company statement, five white tiles (3 + wide + narrow). It replaces both the old "Who we are" and "Why choose us" blocks; the five reasons are the five tiles. The tiles are static and only their contents fade in on scroll.
- [x] **Projects (image 7).** `ProjectFeature`: large title, date chip, write-up, "Ask about project", status/goal/impact column, full-width photo. Data moved to `lib/projects.ts`.
- [x] **Strategic partnerships (image 8)** and **Impact goals (image 9).** `PartnershipsSection`, `ImpactGoalsSection`; same card content, contents fade in onto static tiles.
- [x] **Closing CTA.** `ScrollFade`: the words fade in and rise as you scroll, over the photo (scroll-linked, so it reverses on scroll up). `CtaBand` is now always an inset card on the page background.
- [x] **White before the footer (image 3).** Every page now ends on the page background: `CtaBand` is an inset card, the footer sits in a `bg-background` wrapper, and a test fails if any page's last section is a full-bleed colour.
- [x] **Contact page (image 4).** Gradient removed (`--page-gradient` deleted). New "Visit our office" section (`#map`) with the Google map, directions and open-in-Maps links.
- [x] **Mobile menu.** Floating frosted-glass panel that grows out of the hamburger (which turns into an X) with items staggering in, and reverses on close: items drop away, then the panel shrinks back into the button. Radix Dialog still provides focus trap, Escape, scroll lock and focus return. `ui/sheet.tsx` and the old drawer tokens and keyframes were removed.
- [x] **Footer.** The logo (on a light plate) replaces the icon and wordmark.
- [x] **Dedicated pages for footer content.** `/services/[slug]` (6 pages), `/projects/[slug]` (2 pages); footer services link to them, the address links to `/contact#map`. "Ask about project" now opens the project's page. The services page gained a "Service details" link per card.
- [x] **Privacy policy** and its date updated to disclose the optional Google map.

## Notes for review

- **Map loads on click.** Google's embed sets cookies, and the privacy policy says the site sets none, so the map shows a placeholder until the visitor presses "Load interactive map". The only published location is the text address "Ketu, Lagos, Nigeria", so the map searches for that text rather than a hand-typed pin. For an exact pin, give me the coordinates or a Google Maps share link.
- **Project date.** Only the Covenant project shows a date (Feb 3, 2025, from the wireframe); the other has none, so no chip is shown.
- **Unused photo slots.** `home-people` and `projects-community` are no longer shown anywhere (the wireframes have no photo in those sections). They are left in `lib/imagery.ts` and `PHOTO-REQUEST.md`; delete both together if you do not want those photos.
- **Vision type.** The wireframe heading is italic; the display face has no italic and the project forbids faked styles, so it is upright.
- **Footer logo plate.** `logo.png` was not available to inspect, so it sits on a light plate to stay legible on the dark footer.

---

# Wireframe pass: frosted navbar, footer, contact page, landing page

Implements the five wireframe screenshots without changing the design system:
every colour still comes from a token in `app/globals.css`, every CTA is still
the secondary colour, and the layout, motion and accessibility rules are kept.

## To-do (all verified)

- [x] **Frosted-glass navbar.** New `glass` utility: blur and saturation lift over a translucent white tint, a bright inner top edge, a hairline outline. Firms up once scrolled (`data-scrolled`), and falls back to a near-opaque tint where `backdrop-filter` is unsupported.
- [x] **Outline, not underline, on nav links.** Hover shows a hairline pill; the active page gets a firmer ring and a faint wash. The `::after` underline is gone from `navigation-menu.tsx`. The ring is always 1px (transparent at rest), so nothing shifts on hover.
- [x] **Footer from the wireframe.** Rounded top, hairline, brand column plus Quick links, Our services and Talk to us, a copyright and legal bar, and an oversized cropped wordmark (decorative, `aria-hidden`). Content is Dara-Manihot's own; the wireframe's placeholder text was not copied. Social links, legal links and the `/services#<id>` deep links are unchanged.
- [x] **Contact page from the wireframe.** Split layout: eyebrow, heading, lead and an icon list (email, phone, hours, office) on the left; the enquiry form on a dark card on the right. Copy-to-clipboard buttons kept. The four "How to reach us" cards and the "Ready to start?" card repeated the list and were removed; the office photo slot moved next to "Why get in touch?".
- [x] **White-to-logo-green page gradient** (`--page-gradient`, `bg-page-gradient`). White holds to 55%, then mint, then the logo green. Text only ever sits on white or pale mint; the full green is kept to a text-free strip above the footer.
- [x] **Form on the dark card without touching the form.** `surface-canopy` re-points the colour tokens for everything inside it, so `Input`, `Select`, `Textarea`, labels, hints, errors and focus rings restyle automatically. Labels stay visible (the wireframe shows placeholders only; placeholders are not labels). Errors use a new light-red token, `--brand-danger-light`, so they stay AA on the dark card. The submit button is now a full-width pill.
- [x] **Landing page.** Stats band directly under the hero (`StatsBand`), replacing the figures that sat beside "Who we are". The closing call-to-action is now the inset photo card "Join us in transforming agriculture" (`CtaBand` gained an optional `image`; the other three pages are unchanged).

## Notes for review

- **CTA colour.** The wireframe's closing button is green. It is purple here on purpose: `e2e/layout.spec.ts` enforces that every CTA uses `--secondary`.
- **Closing photo.** `CTA_BAND_IMAGE` in `lib/constants.ts` points at `/images/hero/image5.png` (tractor between crop rows). To use the aerial farm photo from the wireframe, add it under `public/images/` and change `src`.
- **Placeholder figures.** The wireframe's "457+" and "5+" were not copied; the band uses the real figures already on the site.

## Verification

| Check | Result |
| --- | --- |
| Unit and component tests (Vitest) | **344 pass** (308 existing + 36 new) |
| `tsc`, ESLint | 0 errors |
| Browser spot-checks in Chromium (h1 count, console errors, 360px overflow, CTA token, glass applied, outline ring, copy button, form validation, dark-surface focus and error colours) | all pass |
| Mutation check: 6 behaviours broken on purpose | **6/6 caught** |

---

# Scope alignment: sustainable energy, enquiry form, email workflow

Brings the site in line with the Scope of Work (14 Sept 2026) and the Project
Plan. Item by item mapping: [SCOPE-TRACEABILITY.md](SCOPE-TRACEABILITY.md).

## Added

- **Two pillar positioning.** Sustainable Agriculture and Sustainable Energy at equal weight: hero badges, two cards under the hero, Services split into a section per pillar with jump links. Existing service write-ups are untouched, only tagged with a pillar.
- **Enquiry form** on Contact (name, email, phone, service, message): shared client and server validation, accessible errors and confirmation, mobile friendly inputs, deep links from every service card (`/contact?service=...#enquiry`).
- **Spam protection** without CAPTCHA: honeypot, timing trap, per IP and overall rate limits.
- **Email workflow** over SMTP (`nodemailer`): branded notification to Dara-Manihot with Reply-To set to the visitor, branded acknowledgement to the visitor, shared reference number, HTML plus plain text, all visitor input escaped.
- **Imagery system**: one manifest (`lib/imagery.ts`) for twelve photo slots across the five pages, branded fallback panels, optional on-screen photo briefs for staging.
- **Webmail provisioning** script for the five mailboxes (cPanel UAPI, dry run by default) and `pnpm launch:check`.
- **Docs**: email setup, photo request, UAT checklist, scope traceability.

## Changed

- Privacy Policy now describes the enquiry form, the spam checks and the email service (it previously said the site had no forms). `LEGAL_LAST_UPDATED` bumped.
- Projects team data moved to `lib/team.ts`; entries from the original site flagged `placeholder: true` and block launch until replaced.
- `SectionHeading` accepts an optional `id` so a section can be named by its heading.

## Fixed

- 28 tests only passed in a checkout folder named `site` (a hardcoded path in `design-tokens.test.ts`). They now pass anywhere.
- `tests/site-data.test.ts` required a personal email in `humans.txt` that the public file deliberately does not contain.

## Verification

| Check | Result |
| --- | --- |
| `pnpm build` | pass, `/api/enquiry` dynamic, 8 pages static |
| `tsc`, ESLint, Biome | 0 errors |
| Unit and component tests (Vitest) | **307 pass** |
| Browser tests (Playwright, desktop and mobile) | **113 pass**, 0 fail (7 skipped, as before) |
| Mutation check: 5 security and reliability behaviours broken on purpose | **5/5 caught** |

---

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
