/**
 * Sanity Studio encodes focused-field state in the URL (e.g. ,path=someField).
 * When a field is removed from the schema but the URL still references it,
 * Studio crashes with "Cannot read properties of undefined (reading '_rev')".
 *
 * Also fix double-encoded array item paths (%255B → %5B) caused by Next.js
 * router re-encoding Sanity's bracket-based item selectors.
 */
export function stripLegacyMatchFieldPaths(pathname: string): string {
  let cleaned = pathname
    // Fix double-encoded brackets: %255B → %5B, %255D → %5D, %253D → %3D, %2522 → %22
    .replace(/%25([0-9A-Fa-f]{2})/g, '%$1')
    // Strip encoded ,path= segments (any characters until next encoded comma or end)
    .replace(/%2Cpath%3D[^%,/]*/gi, '')
    // Strip plain ,path= segments (any characters until next comma or slash or end)
    .replace(/,path=[^,/]*/gi, '')
  return cleaned
}
