# Cinematic intro - local review

The homepage opens with a five-second Earth-to-nebula sequence that matches the existing neural background. This document covers local replay controls, timing, and verification.

## Preview

Run `npm run dev` and open http://127.0.0.1:3000/intro-preview. Choose **Replay homepage** for the complete sequence, including the actual neural background and hero content. The other controls inspect the existing Earth/nebula scene; the standalone inspector has no homepage anchor scene. This review route is unavailable in production.

## Five-second choreography

| Interval | Movement |
| --- | --- |
| 0.00-0.90s | Immediate gentle pullback, smoothly accelerating |
| 0.65-2.35s | Existing illuminated Earth contour opens into the existing nebula |
| 2.10-4.00s | Nebula strands and particles continuously align with actual homepage anchors |
| 3.75-5.00s | Real homepage reveals while alignment finishes; movement settles |
| 5.00s | All entrance values complete, overlay removed, page interactive |

The Earth textures, lighting, atmosphere, nebula shaders and contour geometry are preserved. The complete Earth group is detached at 2.35s, including clouds and halo.

Removed the separate nebula viewing interval and the old camera path that decelerated too early. Camera position integrates one continuous speed profile, with continuous velocity and acceleration across phase boundaries. The existing nebula drift uses that same motion clock. The homepage's existing neural background keeps moving through the handoff; matching particles use its live projected positions, sizes, colors and brightness.

Hero and navigation entrances now read CSS values written by the intro's RAF from the same elapsed time as the scene. Their former independent delays, including the late CTA and scroll indicator entrance, are gone. They reach their final state by five seconds and do not restart when the overlay unmounts. All exit paths restore full visibility immediately. The unchanged decorative typing and scroll-bounce effects continue as normal homepage animation.

Timing settings live in `components/intro/settings.ts`; interpolation and camera travel live in `components/intro/timeline.ts`. Timeline outputs and geometry buffers are reused instead of allocating new frame objects/attribute lists. All intro materials are compiled before playback. The initial React takeover is committed before exposing the first frame; elapsed time uses `performance.now()` so stale RAF frame-start timestamps cannot delay the sequence. A five-second completion deadline also releases the page if RAF stalls.

## Verification

```text
npm run typecheck
npm run build
node --test scripts/verify-intro.cjs scripts/verify-intro-timeline.cjs
```

The production build and TypeScript check pass. The targeted suite passes all 40 tests covering exact duration, overlapping phases, camera continuity, shared hero timing, stale RAF timestamps, Skip/Escape in every phase, session/reduced-motion bypass, failures, deadlines and cleanup. Lifecycle tests execute the real component with mocked React/DOM/scene boundaries; they do not replace GPU testing.

Browser review at 1280x720 and 390x844 captured normal-playback checkpoints near 0.65s, 2.10s, 3.75s, reveal and completion in `artifacts/intro-five-seconds/`. The original Earth, open nebula and homepage anchors remain visually connected. Measured completion was 5.005-5.011s, reflecting browser timer scheduling; the configured timeline and release deadline are exactly 5.000s. No additional hero entrance runs after completion.

The final uncaptured desktop run logged 463 frames, a maximum frame interval of 31.6ms, and zero intervals over 32ms. The initial React takeover is completed before the clock starts, and memoized lower sections/background avoid an unrelated full-page rerender at reveal. Mobile Skip was also verified in the browser: the overlay, scroll lock, inert state, and entrance overrides were all cleared immediately.

Browser tools expose screenshots but no recording capability, so no video was recorded. Development-only DOM diagnostics report frame count, frames over 32ms, the longest interval and its position in the sequence. These are RAF observations on this desktop, not a physical-phone/GPU benchmark. Capture operations themselves can affect frame timing. Some browser automation tabs lost synchronization after hot reload; fresh tabs recovered.

Skip, Escape, once-per-session behavior, reduced motion, mobile DPR/texture settings, failure fallbacks, resource disposal and the local NASA asset provenance in `public/intro/ATTRIBUTION.md` are retained. Physical phone hardware and physical GPU failure modes have not been tested.
