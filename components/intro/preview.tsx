"use client"

import { useEffect, useRef, useState } from "react"
import { INTRO_SESSION_KEY, INTRO_SETTINGS } from "./settings"
import type { createSpaceScene } from "./space-scene"

type Scene = Awaited<ReturnType<typeof createSpaceScene>>

function stageAt(time: number) {
  if (time < INTRO_SETTINGS.morphStart) return "Orbit"
  if (time < INTRO_SETTINGS.matchStart) return "Earth contour transformation"
  if (time < INTRO_SETTINGS.morphEnd) return "Overlapping contour transformations"
  if (time < INTRO_SETTINGS.handoffStart) return "Matching homepage contours"
  return "Homepage handoff"
}

/** Local review controls for inspecting the actual intro without racing its clock. */
export function IntroPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<Scene | null>(null)
  const frameRef = useRef(0)
  const timeRef = useRef(0.5)
  const [time, setTime] = useState(0.5)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function pause() {
    cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
    setPlaying(false)
  }

  function draw(nextTime: number) {
    const value = Math.min(INTRO_SETTINGS.duration, Math.max(0, nextTime))
    timeRef.current = value
    if (canvasRef.current) canvasRef.current.dataset.time = value.toFixed(3)
    try {
      sceneRef.current?.render(value)
      return true
    } catch (failure) {
      pause()
      sceneRef.current?.dispose()
      sceneRef.current = null
      setReady(false)
      setError(failure instanceof Error ? failure.message : "The scene could not be rendered.")
      return false
    }
  }

  function seek(nextTime: number) {
    pause()
    draw(nextTime)
    setTime(timeRef.current)
  }

  function play() {
    pause()
    if (!sceneRef.current) return
    setPlaying(true)
    setTime(0)
    draw(0)
    const startedAt = performance.now()
    let labelUpdatedAt = startedAt
    function advance(now: number) {
      const elapsed = Math.min((now - startedAt) / 1000, INTRO_SETTINGS.duration)
      if (!draw(elapsed)) return
      // The scene clock stays outside React. Only this review toolbar needs updates.
      if (now - labelUpdatedAt > 80 || elapsed === INTRO_SETTINGS.duration) {
        setTime(elapsed)
        labelUpdatedAt = now
      }
      if (elapsed < INTRO_SETTINGS.duration) {
        frameRef.current = requestAnimationFrame(advance)
      } else {
        frameRef.current = 0
        setPlaying(false)
      }
    }
    frameRef.current = requestAnimationFrame(advance)
  }

  function replayHomepage() {
    try {
      sessionStorage.removeItem(INTRO_SESSION_KEY)
    } catch {
      // The homepage also handles browsers that restrict session storage.
    }
    window.location.assign("/")
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const controller = new AbortController()
    let mounted = true
    let ownedScene: Scene | null = null

    function resize() {
      if (!ownedScene) return
      try {
        ownedScene.resize(canvas!.clientWidth, canvas!.clientHeight)
        ownedScene.render(timeRef.current)
      } catch (failure) {
        fail(failure)
      }
    }

    function fail(failure: unknown) {
      controller.abort()
      cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
      ownedScene?.dispose()
      sceneRef.current = null
      if (!mounted) return
      setReady(false)
      setPlaying(false)
      setError(failure instanceof Error ? failure.message : "The scene could not be loaded.")
    }

    function contextLost(event: Event) {
      event.preventDefault()
      if (!controller.signal.aborted) fail(new Error("The WebGL context was lost. Reload to review again."))
    }

    function visibilityChanged() {
      if (document.hidden) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = 0
        setTime(timeRef.current)
        setPlaying(false)
      }
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    canvas.addEventListener("webglcontextlost", contextLost)
    document.addEventListener("visibilitychange", visibilityChanged)

    const device = navigator as Navigator & { deviceMemory?: number }
    const lowPower = window.matchMedia("(max-width: 767px)").matches
      || (device.hardwareConcurrency > 0 && device.hardwareConcurrency <= 4)
      || (device.deviceMemory !== undefined && device.deviceMemory <= 4)

    void import("./space-scene")
      .then(({ createSpaceScene: create }) => create(canvas, { lowPower, signal: controller.signal }))
      .then((scene) => {
        if (!mounted || controller.signal.aborted) {
          scene.dispose()
          return
        }
        ownedScene = scene
        sceneRef.current = scene
        resize()
        if (!controller.signal.aborted) setReady(true)
      })
      .catch((failure: unknown) => {
        if (!controller.signal.aborted) fail(failure)
      })

    return () => {
      mounted = false
      controller.abort()
      cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
      resizeObserver.disconnect()
      canvas.removeEventListener("webglcontextlost", contextLost)
      document.removeEventListener("visibilitychange", visibilityChanged)
      ownedScene?.dispose()
      if (sceneRef.current === ownedScene) sceneRef.current = null
    }
  }, [])

  const buttonClass = "rounded-full border border-white/15 px-3 py-1.5 text-xs text-slate-200 transition hover:border-cyan-300/50 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 disabled:opacity-40"

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#02050b] text-white">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        data-time={time.toFixed(3)}
        aria-label="Cinematic Earth and nebula introduction preview"
      />
      <div className="pointer-events-none absolute inset-x-4 top-5 text-center text-xs tracking-wide text-slate-400">
        Local intro review
      </div>
      {error && (
        <p role="alert" className="absolute inset-x-6 top-1/2 -translate-y-1/2 text-center text-sm text-slate-300">
          {error}
        </p>
      )}
      <section
        aria-label="Intro review controls"
        className="absolute inset-x-3 bottom-3 mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/85 p-4 shadow-2xl backdrop-blur-md sm:bottom-5 sm:gap-4 sm:p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <output aria-live={playing ? "off" : "polite"}>
            {ready ? `${stageAt(time)} · ${time.toFixed(2)}s / ${INTRO_SETTINGS.duration}s` : error ? "Preview unavailable" : "Preparing scene…"}
          </output>
          <span>Development only</span>
        </div>
        <input
          aria-label="Animation time"
          className="w-full accent-cyan-300"
          type="range"
          min={0}
          max={INTRO_SETTINGS.duration}
          step={0.01}
          value={time}
          onChange={(event) => seek(Number(event.target.value))}
          disabled={!ready}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={buttonClass} disabled={!ready} onClick={() => seek(0.5)}>Orbit</button>
          <button type="button" className={buttonClass} disabled={!ready} onClick={() => seek(1.5)}>Transform</button>
          <button type="button" className={buttonClass} disabled={!ready} onClick={() => seek(2.35)}>Nebula</button>
          <button type="button" className={buttonClass} disabled={!ready} onClick={() => seek(3.75)}>Match</button>
          <button type="button" className={buttonClass} disabled={!ready} onClick={playing ? () => seek(timeRef.current) : play}>
            {playing ? "Pause journey" : "Play journey"}
          </button>
          <button type="button" className={`${buttonClass} sm:ml-auto`} onClick={replayHomepage}>Replay homepage</button>
        </div>
      </section>
    </main>
  )
}
