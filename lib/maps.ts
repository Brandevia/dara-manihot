/**
 * Google Maps URLs for a text address. The address is the only location the
 * site publishes (COMPANY_INFO.address), so the map is found by searching for
 * that text rather than by a hand-typed coordinate pair.
 */
const enc = encodeURIComponent

/** Keyless embed URL for an <iframe>. */
export const mapEmbedUrl = (query: string) =>
  `https://www.google.com/maps?q=${enc(query)}&output=embed`

/** Opens the place in Google Maps. */
export const mapSearchUrl = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${enc(query)}`

/** Opens turn-by-turn directions to the place, from the visitor's location. */
export const mapDirectionsUrl = (query: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${enc(query)}`
