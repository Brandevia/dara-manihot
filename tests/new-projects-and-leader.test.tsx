import fs from 'node:fs'
import path from 'node:path'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ProjectPage, {
  generateStaticParams,
} from '@/app/(pages)/projects/[slug]/page'
import ProjectsPage from '@/app/(pages)/projects/page'
import { LeaderProfile } from '@/components/sections/leader-profile'
import { getPhotoSlot, hasRealPhoto } from '@/lib/imagery'
import { getProject, PROJECTS } from '@/lib/projects'
import { LEADER } from '@/lib/summit'
import { ROOT } from './helpers'

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
}))

const NEW_PROJECTS = [
  {
    slug: 'abuad-green-energy-hub-development-plan',
    title: 'ABUAD Green Energy Hub Development Plan',
    photo: 'projects-abuad-green-energy-hub',
  },
  {
    slug: 'ekiti-knowledge-zone-green-energy-industrial-hub',
    title: 'Ekiti Knowledge Zone Green Energy and Industrial Hub',
    photo: 'projects-ekiti-knowledge-zone',
  },
  {
    slug: 'mesmo-africa-solar-pv-integrated-energy-systems',
    title: 'MESMO Africa Ltd Solar PV Integrated Energy Systems',
    photo: 'projects-mesmo-solar-pv',
  },
] as const

/** PNG/JPEG pixel size straight from the file header: no image library. */
function jpegSize(file: string) {
  const buf = fs.readFileSync(file)
  let i = 2
  while (i < buf.length) {
    const marker = buf[i + 1]
    const length = buf.readUInt16BE(i + 2)
    if (marker >= 0xc0 && marker <= 0xc3)
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) }
    i += 2 + length
  }
  throw new Error('no size')
}

describe('new projects (lib/projects.ts)', () => {
  it('keeps the two original projects first and appends the three new ones in order', () => {
    expect(PROJECTS.map((p) => p.slug)).toEqual([
      'covenant-university-green-energy-hub',
      'circular-fertilizer-initiatives',
      ...NEW_PROJECTS.map((p) => p.slug),
    ])
  })

  it.each(NEW_PROJECTS)(
    '$title: exact title, usable slug, own photo slot',
    (n) => {
      const project = getProject(n.slug)
      expect(project?.title).toBe(n.title)
      expect(n.slug).toMatch(/^[a-z0-9-]+$/)
      expect(project?.photo).toBe(n.photo)
      expect(project?.description.length).toBeGreaterThan(40)
      expect(project?.details.length).toBeGreaterThan(40)
      // No impact figure or date has been supplied, so none may be claimed.
      expect(project?.impact).toBeUndefined()
      expect(project?.date).toBeUndefined()
    },
  )

  it('has unique slugs and a unique photo slot per project', () => {
    const slugs = PROJECTS.map((p) => p.slug)
    const photos = PROJECTS.map((p) => p.photo)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(new Set(photos).size).toBe(photos.length)
  })

  it.each(NEW_PROJECTS)('$photo points at an image file that exists', (n) => {
    const slot = getPhotoSlot(n.photo)
    expect(slot.src).toBeTruthy()
    expect(fs.existsSync(path.join(ROOT, 'public', slot.src ?? ''))).toBe(true)
    expect(slot.alt.length).toBeGreaterThan(20)
  })

  it('counts the real photo as real and the two AI concept renders as pending', () => {
    // launch:check must keep flagging the generated renders until real photos arrive.
    expect(hasRealPhoto(getPhotoSlot('projects-abuad-green-energy-hub'))).toBe(
      true,
    )
    expect(hasRealPhoto(getPhotoSlot('projects-ekiti-knowledge-zone'))).toBe(
      false,
    )
    expect(hasRealPhoto(getPhotoSlot('projects-mesmo-solar-pv'))).toBe(false)
  })
})

describe('/projects shows the new projects', () => {
  it('lists every project as a feature with its own photo and page link', () => {
    const { container } = render(<ProjectsPage />)
    for (const n of NEW_PROJECTS) {
      expect(
        screen.getByRole('heading', { level: 2, name: n.title }),
      ).toBeInTheDocument()
      expect(
        container.querySelector(`[data-photo-slot="${n.photo}"] img`),
      ).not.toBeNull()
      expect(
        container.querySelector(`a[href="/projects/${n.slug}"]`),
      ).not.toBeNull()
    }
  })

  it('still shows exactly one Impact figure (the Circular Fertilizer one)', () => {
    const { container } = render(<ProjectsPage />)
    const impact = [...container.querySelectorAll('dt')].filter(
      (dt) => dt.textContent === 'Impact',
    )
    expect(impact).toHaveLength(1)
  })
})

describe('project pages for the new projects', () => {
  it('are statically generated', () => {
    const params = generateStaticParams().map((p) => p.slug)
    for (const n of NEW_PROJECTS) expect(params).toContain(n.slug)
  })

  it.each(NEW_PROJECTS)(
    '$slug renders an h1, its photo and the other four projects',
    async (n) => {
      const ui = await ProjectPage({
        params: Promise.resolve({ slug: n.slug }),
      })
      const { container } = render(ui)
      expect(
        screen.getByRole('heading', { level: 1, name: n.title }),
      ).toBeInTheDocument()
      expect(
        container.querySelector(`[data-photo-slot="${n.photo}"] img`),
      ).not.toBeNull()
      const more = screen
        .getByRole('heading', { name: 'More projects' })
        .closest('section') as HTMLElement
      expect(within(more).getAllByRole('link')).toHaveLength(
        PROJECTS.length - 1,
      )
    },
  )

  it('still 404s for an unknown slug', async () => {
    await expect(
      ProjectPage({ params: Promise.resolve({ slug: 'nope' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND')
  })
})

describe('CEO portrait is shown whole', () => {
  it('uses the supplied landscape photo at its real size and aspect ratio', () => {
    expect(LEADER.photo.src).toBe('/images/leadership/ceo.jpg')
    expect(jpegSize(path.join(ROOT, 'public', LEADER.photo.src))).toEqual({
      width: 2077,
      height: 1139,
    })
    expect(LEADER.photo.width / LEADER.photo.height).toBeCloseTo(2077 / 1139, 3)
  })

  it('does not crop: no fixed aspect, no object-cover, no object-position', () => {
    render(<LeaderProfile />)
    const img = screen.getByAltText(LEADER.photo.alt)
    expect(img).toHaveAttribute('width', String(LEADER.photo.width))
    expect(img).toHaveAttribute('height', String(LEADER.photo.height))
    expect(img.className).not.toMatch(/object-cover|aspect-\[/)
    expect(img).toHaveClass('h-auto', 'w-full')
    expect((img as HTMLElement).style.objectPosition).toBe('')
  })

  it('gives the photo the wider column on large screens and keeps the mint frame', () => {
    const { container } = render(<LeaderProfile />)
    expect(
      container.querySelector('.lg\\:grid-cols-\\[7fr_5fr\\]'),
    ).not.toBeNull()
    expect(screen.getByAltText(LEADER.photo.alt).parentElement).toHaveClass(
      'bg-mint',
      'p-3',
    )
  })
})
