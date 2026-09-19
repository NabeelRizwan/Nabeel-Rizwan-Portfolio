import { INTRO_SETTINGS as settings } from "./settings"

const clamp = (value: number) => Math.min(1, Math.max(0, value))
// Quintic easing has zero acceleration at its ends, including overlapping phases.
const smooth = (start: number, end: number, time: number) => {
  const t = clamp((time - start) / (end - start))
  return clamp(t * t * t * (10 + t * (-15 + 6 * t)))
}
const integratedSmooth = (start: number, end: number, time: number) => {
  const duration = end - start
  const t = clamp((time - start) / duration)
  return duration * (2.5 * t ** 4 - 3 * t ** 5 + t ** 6) + Math.max(0, time - end)
}

export type IntroTimeline = {
  travel: number; speed: number; motionTime: number; morph: number;
  earthVisible: boolean; nebulaReveal: number; match: number; handoff: number;
  heading: number; details: number; actions: number; scroll: number; navigation: number;
}

/** One five-second clock; callers may reuse an output object inside their RAF. */
export function sampleIntroTimeline(elapsed: number, output = {} as IntroTimeline): IntroTimeline {
  const time = Math.max(0, Math.min(settings.duration, elapsed))
  // Integrate one speed profile: immediate travel, gentle acceleration, then
  // sustained motion until the final homepage settlement. No segment restarts.
  output.travel = .2 * time + .14 * integratedSmooth(0, settings.accelerationEnd, time)
    - .34 * integratedSmooth(settings.handoffStart, settings.duration, time)
  output.speed = .2 + .14 * smooth(0, settings.accelerationEnd, time)
    - .34 * smooth(settings.handoffStart, settings.duration, time)
  output.motionTime = output.travel / .34
  output.morph = smooth(settings.morphStart, settings.morphEnd, time)
  output.earthVisible = time < settings.earthHiddenAt
  output.nebulaReveal = output.morph
  output.match = smooth(settings.matchStart, settings.matchEnd, time)
  output.handoff = smooth(settings.handoffStart, settings.duration, time)
  output.heading = smooth(settings.handoffStart, 4.65, time)
  output.details = smooth(3.85, 4.8, time)
  output.actions = smooth(4, 4.9, time)
  output.scroll = smooth(4.15, settings.duration, time)
  output.navigation = smooth(settings.handoffStart, 4.5, time)
  return output
}
