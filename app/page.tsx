"use client"

import { useState, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { IntroAnimation } from "@/components/intro-animation"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/sections/hero"
import { AboutSection } from "@/components/sections/about"
import { SkillsSection } from "@/components/sections/skills"
import { ProjectsSection } from "@/components/sections/projects"
import { VisualizationsSection } from "@/components/sections/visualizations"
import { ExperienceSection } from "@/components/sections/experience"
import { BlogSection } from "@/components/sections/blog"
import { ContactSection } from "@/components/sections/contact"
import { Footer } from "@/components/footer"

export default function Home() {
  const [showIntro, setShowIntro] = useState(true)

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false)
  }, [])

  return (
    <>
      <AnimatePresence>
        {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showIntro ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      >
        <Navbar />
        <main>
          <HeroSection />
          <AboutSection />
          <SkillsSection />
          <ProjectsSection />
          <VisualizationsSection />
          <ExperienceSection />
          <BlogSection />
          <ContactSection />
        </main>
        <Footer />
      </motion.div>
    </>
  )
}
