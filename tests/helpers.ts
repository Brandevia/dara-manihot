import fs from 'node:fs'
import path from 'node:path'

export const ROOT = path.resolve(__dirname, '..')

/** Every route that has a page.tsx, e.g. "/", "/about" (route groups ignored). */
export function discoverRoutes(): string[] {
  const appDir = path.join(ROOT, 'app')
  const routes: string[] = []
  const walk = (dir: string, segments: string[]) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const isGroup = entry.name.startsWith('(') && entry.name.endsWith(')')
        walk(
          path.join(dir, entry.name),
          isGroup ? segments : [...segments, entry.name],
        )
      } else if (entry.name === 'page.tsx') {
        routes.push(`/${segments.join('/')}`)
      }
    }
  }
  walk(appDir, [])
  return routes.sort()
}

export function readSource(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8')
}

export function listFiles(dir: string, exts: string[]): string[] {
  const out: string[] = []
  const walk = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name)
      if (e.isDirectory()) {
        if (['node_modules', '.next', 'tests'].includes(e.name)) continue
        walk(full)
      } else if (exts.some((x) => e.name.endsWith(x))) out.push(full)
    }
  }
  walk(path.join(ROOT, dir))
  return out
}

/**
 * Replaces each dynamic segment ("/services/[slug]") with every value the page
 * generates statically, so links like /services/green-hydrogen can be checked.
 */
export function expandDynamicRoutes(
  routes: string[],
  params: Record<string, string[]>,
): string[] {
  return routes.flatMap((route) =>
    route.includes('[')
      ? (params[route] ?? []).map((v) => route.replace(/\[[^\]]+\]/, v))
      : [route],
  )
}
