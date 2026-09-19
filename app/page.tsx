"use client"

import { memo, useState, useRef } from "react"
import { RotateCcw } from "lucide-react"
import { IntroAnimation, type IntroPhase } from "@/components/intro-animation"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/sections/hero"
import { AboutSection } from "@/components/sections/about"
import { SkillsSection } from "@/components/sections/skills"
import { ProjectsSection } from "@/components/sections/projects"
import { VisualizationsSection } from "@/components/sections/visualizations"
import { ExperienceSection } from "@/components/sections/experience"
import { ProfessionalFocusSection } from "@/components/sections/blog"
import { ContactSection } from "@/components/sections/contact"
import { Footer } from "@/components/footer"

const StaticNavbar = memo(Navbar)
const StaticFooter = memo(Footer)
const IntroHero = memo(HeroSection)
// Intro phase changes only concern the hero. Keep the rest of the portfolio
// out of the reveal commit so it cannot interrupt the five-second movement.
const PortfolioSections = memo(function PortfolioSections() {
  return <>
    <AboutSection />
    <SkillsSection />
    <ProjectsSection />
    <VisualizationsSection />
    <ExperienceSection />
    <ProfessionalFocusSection />
    <ContactSection />
  </>
})

export default function Home() {
  const [introPhase, setIntroPhase] = useState<IntroPhase>("waiting")
  const [introRun, setIntroRun] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const revealed = introPhase !== "playing"
  const replayLoading = introRun > 0 && introPhase === "waiting"
  const replayVisible = introPhase === "complete" || replayLoading

  const replayIntro = () => {
    if (introPhase !== "complete") return
    setIntroRun((run) => run + 1)
    setIntroPhase("waiting")
  }

  return (
    <>
      {introPhase !== "complete" && (
        <IntroAnimation key={introRun} contentRef={contentRef} onPhaseChange={setIntroPhase} replay={introRun > 0} />
      )}
      <div ref={contentRef} id="portfolio-content">
        <StaticNavbar />
        <main>
          <IntroHero revealed={revealed} backgroundActive />
          <PortfolioSections />
        </main>
        <StaticFooter />
        <button
          type="button"
          className="intro-replay"
          data-visible={replayVisible}
          aria-hidden={!replayVisible}
          aria-disabled={introPhase !== "complete"}
          aria-busy={replayLoading}
          tabIndex={introPhase === "complete" ? 0 : -1}
          onClick={replayIntro}
        >
          <RotateCcw size={16} aria-hidden="true" />
          <span>{replayLoading ? "Loading intro…" : "Replay intro"}</span>
        </button>
      </div>
    </>
  )
}
