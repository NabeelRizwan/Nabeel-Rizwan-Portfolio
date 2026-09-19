// Timeline values are seconds; loading deadlines are milliseconds.
export const INTRO_SETTINGS = {
  duration: 5,
  morphStart: 0.65,
  accelerationEnd: 0.9,
  morphEnd: 2.35,
  earthHiddenAt: 2.35,
  matchStart: 2.1,
  matchEnd: 4,
  handoffStart: 3.75,
  loadDeadlineMs: 3000,
  maxDpr: 1.5,
  mobileDpr: 1.25,
  stars: 1800,
  mobileStars: 700,
  nebulaIntensity: 0.65,
  earthRotation: 0.025,
} as const

export const INTRO_SESSION_KEY = "nr:space-intro:v1"

export function hasSeenIntro() {
  try {
    return sessionStorage.getItem(INTRO_SESSION_KEY) === "seen"
  } catch {
    return false
  }
}

export function rememberIntro() {
  try {
    sessionStorage.setItem(INTRO_SESSION_KEY, "seen")
  } catch {
    // Storage restrictions must never prevent entering the page.
  }
}
