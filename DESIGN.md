---
version: alpha
name: Dara-Manihot Industries & Farms
description: Marketing site for a Nigerian agribusiness and clean-energy company. Ivory pages, logo green for trust, logo purple for the single call to action, and motion that is short, springy and always optional.
colors:
  primary: "#176827"
  primary-hover: "#11501d"
  on-primary: "#ffffff"
  secondary: "#84289a"
  secondary-hover: "#6c1b7d"
  on-secondary: "#ffffff"
  secondary-soft: "#f3e6f7"
  neutral: "#fbfcfa"
  surface: "#ffffff"
  muted: "#f0f5ee"
  mint: "#c7e4cb"
  ink: "#16211a"
  slate: "#4f5f54"
  line: "#d9e3d8"
  canopy: "#08280d"
  on-canopy: "#ffffff"
  canopy-muted: "#c7e4cb"
  focus: "#1f7f31"
  danger: "#b42318"
typography:
  display:
    fontFamily: Young Serif
    fontSize: 68px
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: -0.015em
  title:
    fontFamily: Young Serif
    fontSize: 48px
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: -0.01em
  statement:
    fontFamily: Young Serif
    fontSize: 44px
    fontWeight: 400
    lineHeight: 1.28
  subhead:
    fontFamily: Young Serif
    fontSize: 30px
    fontWeight: 400
    lineHeight: 1.2
  lead:
    fontFamily: Figtree
    fontSize: 22px
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: Figtree
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: Figtree
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.14em
  button:
    fontFamily: Figtree
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1
rounded:
  sm: 8px
  md: 10px
  lg: 12px
  xl: 16px
  2xl: 22px
  frame: 32px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  section: 112px
  container: 1216px
components:
  button-cta:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    height: 48px
    padding: 24px
  button-cta-hover:
    backgroundColor: "{colors.secondary-hover}"
  badge-soft:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: 12px
  figure-tile:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.xl}"
    padding: 24px
  photo-frame:
    backgroundColor: "{colors.mint}"
    rounded: "{rounded.frame}"
    padding: 12px
  photo:
    rounded: "{rounded.2xl}"
  tabs-track:
    backgroundColor: "{colors.muted}"
    rounded: "{rounded.2xl}"
    padding: 6px
  tab-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.xl}"
    height: 48px
  tab-idle:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.slate}"
    rounded: "{rounded.xl}"
    height: 48px
  accordion-row:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.ink}"
    typography: "{typography.subhead}"
    height: 64px
  lightbox:
    backgroundColor: "{colors.canopy}"
    textColor: "{colors.on-canopy}"
    rounded: "{rounded.2xl}"
  lightbox-control:
    backgroundColor: "{colors.canopy}"
    textColor: "{colors.canopy-muted}"
    rounded: "{rounded.full}"
    size: 48px
---

## Overview

The site should feel like a well-kept farm office on a bright morning: ivory paper, green ink, one purple stamp. It speaks to three readers who each decide in seconds: a manufacturer weighing a solar contract, a funder reading a project page on a phone, and a partner checking that the company is real. So proof comes before persuasion: figures count up, photos are real, and every claim is attributed.

Colour is rationed. Green (`{colors.primary}`) carries identity and numbers. Purple (`{colors.secondary}`) is reserved for the one action on a screen that matters. Everything else is ivory, mist and ink. All styling comes from tokens in `app/globals.css`; no component contains a raw colour, and a test fails if one does.

## Colors

- **Primary, logo green (`#176827`):** headings accents, figures, selected tabs, links. 6.7:1 on ivory.
- **Secondary, logo purple (`#84289a`):** call-to-action buttons only, plus small bullets, the "+" after a counted figure (500+), a project's date chip and its "Ask about project" link. White on it passes AA in every state, including hover; it is 6.3:1 on the pale purple chip and 6.9:1 on mist. The dark-form tokens give 3.4:1, so fix them before a dark toggle ships.
- **Neutral, ivory (`#fbfcfa`):** the page. White (`{colors.surface}`) is for cards that sit on mist.
- **Muted, mist (`#f0f5ee`):** alternate section bands and the tab track.
- **Mint (`#c7e4cb`):** the logo green at 200. Frames around photographs and soft badges.
- **Ink (`#16211a`) and slate (`#4f5f54`):** body text and secondary text. Slate on mist is AA.
- **Canopy (`#08280d`):** the dark surface for the footer, the enquiry card and the photo lightbox.
- **Line (`#d9e3d8`):** hairlines and rings that give white tiles an edge on mist.

A dark theme exists in `globals.css` (`.dark`); the marketing pages ship in light.

## Typography

Young Serif sets the voice: display, titles and the big figures. Figtree does the work: body, labels and buttons. Display sizes are fluid (`clamp`) so a 320px phone and a 1440px desktop both get a sensible measure.

- **Display and title:** Young Serif, tight leading (1.04 to 1.12), slight negative tracking.
- **Lead:** Figtree at 18 to 22px for the sentence under a title.
- **Label:** 14px, medium, uppercase, 0.14em tracking, for eyebrows and definition terms.
- **Figures:** Young Serif in `{colors.primary}`, counted up from zero when scrolled into view; the real value is in the markup first.
- Numbers that change in place use `tabular-nums`.

## Layout

One container (`max 76rem`, fluid side padding) and one vertical rhythm (`--section-y`, 64px on phones to 112px on desktop). Sections alternate between ivory and mist; **every page ends on ivory** so the footer's rounded corners meet white, and a test enforces it.

Grids collapse from the content, not the device: four figure tiles become two at 480px and one below; the gallery is one wide tile plus two pairs on a phone, and a six-column bento from 1024px. No page scrolls sideways at 320, 375, 768 or 1280px. In-page anchors (`#summit`, `#leadership`, `#map`) clear the floating header with `scroll-mt-header`.

## Elevation & Depth

Depth comes from tone first: ivory page, mist band, white tile. Shadows are rare and green-tinted rather than grey: `shadow-float` (small controls) and `shadow-lift` (a photo card). Images get a 1px inset outline of black at 10% so a pale photo never bleeds into a pale page. The header and mobile menu are frosted glass (blur 22px, saturate) that firms up once the page scrolls.

## Shapes

Radii are concentric: a frame's radius equals the inner radius plus the padding. A photo (`{rounded.2xl}`, 22px) inside a 12px frame gives `{rounded.frame}` (32px). Buttons and badges are full pills; tiles and tabs are 16 to 22px; text inputs follow the base 12px. Never mix a sharp inner corner with a rounded outer one.

## Components

- **Call to action** (`button-cta`): a purple pill, 48px tall, with an arrow that nudges 4px on hover. One per view.
- **Figure tile** (`figure-tile`): white, ringed, a counted number over a label and one line of detail. Source and "projection" caveats sit below the group, never inside a tile.
- **Photo frame** (`photo-frame`, `photo`): mint frame, concentric photo, outlined. Used for the CEO portrait and the home spotlight.
- **Sliding tabs** (`tabs-track`, `tab-active`, `tab-idle`): a WAI-ARIA tablist. The green pill glides between tabs; arrows, Home and End move focus; only the active tab is in the tab order. The three-phase model (solar, storage, hydrogen) uses it, with a progress rail as a second cue.
- **Accordion** (`accordion-row`): one open at a time, first open by default so the content exists without JavaScript. Chevron turns, panel eases to its natural height.
- **Gallery and lightbox** (`lightbox`, `lightbox-control`): a bento of openable tiles. The lightbox is a Radix dialog (focus trap, Escape, scroll lock) with previous and next buttons, arrow keys, swipe on touch, a counter, and focus returned to the tile that opened it. Controls are 48px.
- **Counting figure:** `CountUp` animates the number; reduced motion shows the final value. Digits are tabular so the figure does not shift while it counts. A "+" straight after the number is drawn in `{colors.secondary}`, at 0.7em, level with the digits; the text stays "500+" for screen readers.
- **Stats band:** headline figures under the hero, on mist. One centred column on phones, two from 640px, four from 1024px. Every figure counts as it scrolls into view and ends in a purple plus.
- **Mobile menu:** a toggle of two lines (not three) that rotate into an X, in the header pill. The panel hangs one gap below the pill at the same width, is frosted glass, and holds centred text links (48px targets) and one green "Explore Our Services" pill. No icons. It opens by growing down while the links fade and slide in one after another, and closes in reverse. A dim backdrop, a press outside, Escape, a route change or growing to the desktop layout all close it. Reduced motion cross-fades only.
- **Icon-free cards:** the core impact areas, the pillar and service cards and the About vision and mission carry no icon. The title is the largest thing in the card; list ticks and the "learn more" arrow remain.

## Do's and Don'ts

- Do use `{colors.secondary}` for the single primary action on a view; don't use it for decoration, headings or large fills.
- Do write alt text that describes the scene; don't name a person in alt text or a caption unless the source names them.
- Do reserve the photo's real size with `width` and `height`; don't let a gallery jump as it loads.
- Do keep exits shorter than entrances (150ms out, 300ms in); don't animate anything the visitor triggers more than once a second for longer than 300ms.
- Do animate only `transform`, `opacity` and `filter`; don't use `transition: all`. The one exception is the mobile menu panel, whose `height` opens from 0: it is `position: fixed`, so nothing reflows.
- Do name the property Tailwind 4 really sets: `hover:-translate-y-1` writes `translate` and `active:scale-*` writes `scale`, so use `transition-[translate,box-shadow]` or `transition-[scale]`. Naming `transform` makes the movement snap.
- Do reveal each item when it scrolls into view (`StaggerItem`), staggering only the items that arrive together. Don't reveal a whole grid from its container: on a phone the grid is one tall column and the sequence plays off screen.
- Do give every hover effect a touch counterpart: a press state on links, buttons and tiles, and arrows that nudge on press as well as hover.
- Do honour reduced motion by removing movement, not feedback; don't rely on animation alone to show state (selected tabs also change colour and `aria-selected`).
- Don't use Tailwind palette classes (`bg-green-600`) or hex values in components; use tokens.
- Don't end a page on a full-bleed colour band; end on ivory.
- Don't use a photo that is under about 600px wide, visibly blurred, or a weaker copy of another; leave it out.
- Don't add an X (Twitter) link: the company has no account. LinkedIn and Facebook only (`lib/constants.ts`).

## Motion

Motion explains, it does not decorate. Shared ease: `cubic-bezier(0.16, 1, 0.3, 1)` (out-expo) for entrances, `cubic-bezier(0.34, 1.56, 0.64, 1)` (bounce) for small controls.

- **Scroll reveal:** content fades and rises once, 8 to 16px.
- **Tab panel:** enters in 300ms (opacity, 12px rise, 4px blur), exits in 150ms.
- **Tab pill:** a shared-layout spring, 400ms, no bounce.
- **Accordion:** height and opacity, 320ms out-expo.
- **Lightbox:** overlay fades in 250ms; the photo scales from 0.96; next and previous slide 40px from the direction of travel; swipe past 60px changes photo.
- **Gallery tile:** image scales to 1.05 on hover (devices that hover only); pressed tiles scale to 0.98.
- **Reduced motion:** the site-wide `MotionConfig reducedMotion="user"` (`components/animations.tsx`) turns transforms and layout animation off; CSS transitions use `motion-reduce:transition-none`.

## Sources and attribution

Component ideas credited to the libraries listed in `components.txt`: the sliding-pill tabs follow beUI's Tabs; the gallery-to-lightbox idea follows useLayouts' Expandable Gallery; the accordion's easing follows beUI's Bouncy Accordion. Each was re-written for this site's tokens and accessibility rules rather than copied.
