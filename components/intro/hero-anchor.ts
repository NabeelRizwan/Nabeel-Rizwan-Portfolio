/**
 * The actual homepage neural sphere, projected into viewport coordinates.
 * Each array contains NDC x/y pairs; `lines` contains two pairs per segment.
 * Buffers are reused by the homepage renderer and must be treated as read-only.
 */
export type HeroAnchorSnapshot = {
  points: Float32Array
  corePoints: Float32Array
  /** CSS-pixel diameters matching the actual perspective point shaders. */
  pointSizes: Float32Array
  coreSizes: Float32Array
  /** Purple glow shares the original white-node positions in `points`. */
  glowSizes: Float32Array
  pointOpacity: number
  coreOpacity: number
  glowOpacity: number
  lineOpacity: number
  toneMappingExposure: number
  /** Actual hero canvas bounds in viewport NDC: left, bottom, right, top. */
  ndcBounds: Float32Array
  lines: Float32Array
  width: number
  height: number
}

let currentSnapshot: HeroAnchorSnapshot | null = null

export function getHeroAnchorSnapshot(): HeroAnchorSnapshot | null {
  return currentSnapshot
}

export function publishHeroAnchorSnapshot(snapshot: HeroAnchorSnapshot): void {
  currentSnapshot = snapshot
}

export function clearHeroAnchorSnapshot(snapshot?: HeroAnchorSnapshot): void {
  // An older canvas unmounting must not erase a newer canvas's projection.
  if (!snapshot || currentSnapshot === snapshot) currentSnapshot = null
}
