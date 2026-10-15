# Photo request for the client

Project plan, Phase 1, task 3. Send this list to Adekunle Olashile. Every slot
below exists on the site today as a branded placeholder, so each photo drops in
without a redesign.

## What makes a good photo

- **Landscape, 1600 px wide or larger.** Phone photos are fine if taken
  horizontally in daylight.
- **People doing real work**, not posed line ups. Faces visible and smiling
  where natural. Get permission from anyone clearly identifiable.
- **Keep the subject near the middle.** Phones crop the sides.
- Original files, not screenshots or WhatsApp copies, where possible.

## The list

| Slot id | Page | Please send |
| --- | --- | --- |
| `home-agriculture` | Home | Farmers or field staff at work on a Dara-Manihot supported farm |
| `home-energy` | Home | A completed solar PV or biomass installation, ideally with staff |
| `home-people` | Home | The team with farmers or community members on site |
| `about-leadership` | About | A portrait of the founder plus one leadership group photo |
| `about-field` | About | The team in the field: planting, harvesting, residue processing |
| `services-agriculture` | Services | Farm and processing activity: cassava, rice, composting, biochar |
| `services-energy` | Services | Sustainable energy installations: solar arrays, inverters, storage |
| `services-equipment` | Services | Equipment close ups: gasifier, electrolyser, control panels |
| `projects-green-energy-hub` | Projects | Covenant University Green Energy Hub: the site, equipment, partners |
| `projects-circular-fertilizer` | Projects | Fertilizer production or agricultural residue processing |
| `projects-community` | Projects | Training sessions and community impact: cooperatives, women, youth |
| `contact-office` | Contact | The team at the Ketu office, or a welcoming reception shot |

## Also needed

- **Real team members** for the Projects page: name, role, one line each and a
  square portrait. The four entries currently there are placeholders carried
  over from the original site (`lib/team.ts`) and block launch.
- **Confirmed social media links.** The ones in `lib/constants.ts` came from
  the original site and have not been verified.

## Where photos go (developer notes)

1. Save the file under `public/images/` (for example `public/images/home-field.jpg`).
2. In `lib/imagery.ts` set that slot's `src`, and update its `alt` text to
   describe the real photo. Optionally set `position` (for example `'50% 30%'`)
   to keep faces in frame when cropped.
3. Team portraits go in `lib/team.ts`: set `photo` and `placeholder: false`.
4. Run `pnpm launch:check`. Slots still on the generated illustrations show as
   warnings; placeholder team members block launch.

On staging, set `NEXT_PUBLIC_SHOW_PHOTO_SLOTS=true` to print the brief inside
every empty slot, which makes client review of "what is still missing" easy.
Remove it before go live.

Until the client supplies originals, the scope allows suitable professional
stock images (section 4.3). Use only licensed images and record the source.
