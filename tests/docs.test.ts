import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { PHOTO_SLOTS } from '@/lib/imagery'
import { ROOT } from './helpers'

const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8')

describe('docs stay in step with the code', () => {
  it('PHOTO-REQUEST.md lists every photo slot, and nothing else', () => {
    const doc = read('docs/PHOTO-REQUEST.md')
    const documented = [...doc.matchAll(/^\| `([a-z-]+)` \|/gm)].map(
      (m) => m[1],
    )
    expect(documented.sort()).toEqual(PHOTO_SLOTS.map((s) => s.id).sort())
  })

  it('every environment variable in .env.example is explained in EMAIL-SETUP.md', () => {
    const vars = [
      ...read('.env.example').matchAll(/^#?\s*([A-Z][A-Z0-9_]+)=/gm),
    ].map((m) => m[1])
    expect(vars.length).toBeGreaterThan(5)
    const doc = read('docs/EMAIL-SETUP.md')
    for (const v of vars) {
      if (v === 'NEXT_PUBLIC_SHOW_PHOTO_SLOTS') continue // covered in PHOTO-REQUEST.md
      expect(doc, v).toContain(v)
    }
    expect(read('docs/PHOTO-REQUEST.md')).toContain(
      'NEXT_PUBLIC_SHOW_PHOTO_SLOTS',
    )
  })

  it('every `pnpm <script>` named in the docs exists in package.json', () => {
    const scripts = Object.keys(JSON.parse(read('package.json')).scripts)
    const builtins = new Set([
      'install',
      'add',
      'exec',
      'start',
      'dev',
      'build',
    ])
    for (const file of [
      'README.md',
      'docs/EMAIL-SETUP.md',
      'docs/PHOTO-REQUEST.md',
    ]) {
      for (const m of read(file).matchAll(/pnpm ([a-z][a-z0-9:-]*)/g)) {
        const name = m[1]
        if (builtins.has(name)) continue
        expect(scripts, `${file}: pnpm ${name}`).toContain(name)
      }
    }
  })

  it('the five webmail addresses in EMAIL-SETUP.md match the provisioning config', () => {
    const cfg = JSON.parse(read('scripts/webmail-accounts.json'))
    const doc = read('docs/EMAIL-SETUP.md')
    for (const a of cfg.accounts) expect(doc).toContain(`\`${a.local}@\``)
  })
})
