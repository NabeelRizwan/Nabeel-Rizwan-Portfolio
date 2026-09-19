"use client"

import { memo, useState, useRef } from "react"
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
  const contentRef = useRef<HTMLDivElement>(null)
  const revealed = introPhase !== "playing"

  return (
    <>
      {introPhase !== "complete" && <IntroAnimation contentRef={contentRef} onPhaseChange={setIntroPhase} />}
      <div ref={contentRef} id="portfolio-content">
        <StaticNavbar />
        <main>
          <IntroHero revealed={revealed} backgroundActive />
          <PortfolioSections />
        </main>
        <StaticFooter />
      </div>
    </>
  )
}
