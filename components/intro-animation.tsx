"use client"

import { useEffect, useRef, useState, type RefObject } from "react"
import { flushSync } from "react-dom"
import { hasSeenIntro, INTRO_SETTINGS, rememberIntro } from "@/components/intro/settings"
import { sampleIntroTimeline } from "@/components/intro/timeline"
import type { createSpaceScene } from "@/components/intro/space-scene"

export type IntroPhase = "waiting" | "playing" | "revealing" | "complete"

const revealParts = ["heading", "details", "actions", "scroll", "navigation"] as const

type Props = {
  contentRef: RefObject<HTMLDivElement | null>
  onPhaseChange: (phase: IntroPhase) => void
}

export function IntroAnimation({ contentRef, onPhaseChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const skipRef = useRef<HTMLButtonElement>(null)
  const finishRef = useRef<(remember?: boolean) => void>(() => {})
  const [active, setActive] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const overlay = overlayRef.current
    const content = contentRef.current
    if (!canvas || !overlay || !content) return

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined
    if (motion.matches || hasSeenIntro() || location.hash || window.scrollY > 8 ||
      navigation?.type === "back_forward" || document.hidden) {
      onPhaseChange("complete")
      return
    }

    const controller = new AbortController()
    let scene: Awaited<ReturnType<typeof createSpaceScene>> | undefined
    let frame = 0
    let stopped = false
    let playing = false
    let revealing = false
    let elapsed = 0
    let previousTime = 0
    let startedAt = 0
    let frameCount = 0
    let slowFrames = 0
    let maxFrameMs = 0
    let maxFrameAt = 0
    const timeline = sampleIntroTimeline(0)
    const applyReveal = (time: number) => {
      sampleIntroTimeline(time, timeline)
      for (const part of revealParts) content.style.setProperty(`--intro-${part}`, String(timeline[part]))
      overlay.style.opacity = String(1 - timeline.handoff)
    }
    let deadline = 0
    let playbackDeadline = 0
    let previousFocus: HTMLElement | null = null
    let releaseInteraction: (() => void) | undefined

    const finish = (remember = false, unmounting = false) => {
      if (stopped) return
      stopped = true
      cancelAnimationFrame(frame)
      clearTimeout(deadline)
      clearTimeout(playbackDeadline)
      controller.abort()
      scene?.dispose()
      scene = undefined
      overlay.style.visibility = "hidden"
      if (playing && process.env.NODE_ENV === "development") {
        content.dataset.introDuration = ((performance.now() - startedAt) / 1000).toFixed(3)
        content.dataset.introFrames = String(frameCount)
        content.dataset.introSlowFrames = String(slowFrames)
        content.dataset.introMaxFrameMs = maxFrameMs.toFixed(1)
        content.dataset.introMaxFrameAt = maxFrameAt.toFixed(3)
      }
      releaseInteraction?.()
      if (document.activeElement === skipRef.current) {
        if (previousFocus?.isConnected && previousFocus !== document.body) {
          previousFocus.focus({ preventScroll: true })
        } else {
          skipRef.current?.blur()
        }
      }
      if (remember) rememberIntro()
      if (!unmounting) {
        setActive(false)
        onPhaseChange("complete")
      }
    }
    finishRef.current = finish

    const resize = () => {
      try { scene?.resize(window.innerWidth, window.innerHeight) }
      catch { finish() }
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        finish(true)
      } else if (playing && event.key === "Tab") {
        event.preventDefault()
        skipRef.current?.focus({ preventScroll: true })
      } else if (!playing) {
        finish()
      }
    }
    const onMotion = () => { if (motion.matches) finish() }
    // No GPU work or delayed reappearance when returning from a hidden tab.
    const onVisibility = () => { if (document.hidden) finish(playing) }
    const onNavigation = () => finish(playing)
    const onContextLost = (event: Event) => { event.preventDefault(); finish() }
    // Let visitors who interact while assets load keep using the homepage.
    const onInteraction = () => { if (!playing) finish() }

    window.addEventListener("resize", resize)
    window.addEventListener("keydown", onKey)
    window.addEventListener("pointerdown", onInteraction)
    window.addEventListener("scroll", onInteraction, { passive: true })
    window.addEventListener("hashchange", onNavigation)
    window.addEventListener("popstate", onNavigation)
    window.addEventListener("pagehide", onNavigation)
    document.addEventListener("visibilitychange", onVisibility)
    motion.addEventListener("change", onMotion)
    canvas.addEventListener("webglcontextlost", onContextLost)

    const tick = () => {
      if (stopped || !scene) return
      // RAF's frame-start timestamp can predate a long preparation callback.
      // Read the same monotonic clock used by the visible start/deadline.
      const now = performance.now()
      elapsed = (now - startedAt) / 1000
      if (process.env.NODE_ENV === "development") {
        const frameMs = now - previousTime
        frameCount++
        if (frameMs > 32) slowFrames++
        if (frameMs > maxFrameMs) { maxFrameMs = frameMs; maxFrameAt = elapsed }
      }
      previousTime = now
      try {
        scene.render(Math.min(elapsed, INTRO_SETTINGS.duration))
        overlay.dataset.time = elapsed.toFixed(2)
        applyReveal(elapsed)
        if (elapsed >= INTRO_SETTINGS.handoffStart) {
          if (!revealing) { revealing = true; onPhaseChange("revealing") }
        }
        if (elapsed >= INTRO_SETTINGS.duration) { finish(true); return }
        frame = requestAnimationFrame(tick)
      } catch { finish() }
    }

    deadline = window.setTimeout(() => finish(), INTRO_SETTINGS.loadDeadlineMs)
    const lowPower = window.innerWidth < 768 || (navigator.hardwareConcurrency || 4) <= 4 ||
      ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4
    void import("@/components/intro/space-scene")
      .then(({ createSpaceScene }) => stopped ? undefined : createSpaceScene(canvas, { lowPower, signal: controller.signal }))
      .then((loaded) => {
        if (!loaded) return
        if (stopped) { loaded.dispose(); return }
        scene = loaded
        resize()
        if (stopped) return
        // Take over only after a successfully rendered first frame.
        scene.render(0)
        clearTimeout(deadline)
        previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
        const bodyOverflow = document.body.style.overflow
        const htmlOverflow = document.documentElement.style.overflow
        const bodyPadding = document.body.style.paddingRight
        const scrollbar = window.innerWidth - document.documentElement.clientWidth
        const wasInert = content.inert
        content.inert = true
        document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight) + scrollbar}px`
        document.body.style.overflow = "hidden"
        document.documentElement.style.overflow = "hidden"
        releaseInteraction = () => {
          content.inert = wasInert
          document.body.style.overflow = bodyOverflow
          document.documentElement.style.overflow = htmlOverflow
          document.body.style.paddingRight = bodyPadding
          for (const part of revealParts) content.style.removeProperty(`--intro-${part}`)
        }
        playing = true
        applyReveal(0)
        // Commit the one-time React takeover before the first visible frame.
        // Otherwise the page commit can consume the first 50-80ms of playback.
        flushSync(() => {
          setActive(true)
          onPhaseChange("playing")
        })
        overlay.style.visibility = "visible"
        if (previousFocus && content.contains(previousFocus)) skipRef.current?.focus({ preventScroll: true })
        startedAt = previousTime = performance.now()
        // The same five-second deadline releases the page even if RAF stalls.
        playbackDeadline = window.setTimeout(() => finish(true), INTRO_SETTINGS.duration * 1000)
        frame = requestAnimationFrame(tick)
      })
      .catch(() => finish())

    return () => {
      // Development remount/unmount is not completion and never sets the flag.
      finish(false, true)
      window.removeEventListener("resize", resize)
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("pointerdown", onInteraction)
      window.removeEventListener("scroll", onInteraction)
      window.removeEventListener("hashchange", onNavigation)
      window.removeEventListener("popstate", onNavigation)
      window.removeEventListener("pagehide", onNavigation)
      document.removeEventListener("visibilitychange", onVisibility)
      motion.removeEventListener("change", onMotion)
      canvas.removeEventListener("webglcontextlost", onContextLost)
    }
  }, [contentRef, onPhaseChange])

  return (
    <div ref={overlayRef} className="space-intro" data-active={active} aria-hidden={!active}>
      <canvas ref={canvasRef} className="space-intro__canvas" aria-hidden="true" />
      <button ref={skipRef} className="space-intro__skip" onClick={() => finishRef.current(true)} tabIndex={active ? 0 : -1}>
        Skip intro <span aria-hidden="true">↗</span>
      </button>
    </div>
  )
}
