"use client"

import { motion } from "framer-motion"
import { memo } from "react"
import { ArrowDown, Download, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TypingEffect } from "@/components/typing-effect"
import { NeuralBrain } from "@/components/neural-brain"

const HeroBackground = memo(NeuralBrain)

export function HeroSection({ revealed = true, backgroundActive = revealed }: { revealed?: boolean; backgroundActive?: boolean }) {
  const scrollToProjects = () => {
    const element = document.querySelector("#projects")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-28 pb-32">
      {/* 3D Background */}
      <HeroBackground active={backgroundActive} />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background pointer-events-none opacity-50" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="intro-hero-heading">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-sm text-muted-foreground">
              Open to AI, Data Analyst, BI Analyst, and Junior Data Scientist Roles
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
            <span className="block mb-2">{"Hi, I'm"}</span>
            <span className="text-gradient">Nabeel Rizwan</span>
          </h1>

          <p
            className="intro-hero-details mt-4 text-xl sm:text-2xl md:text-3xl font-medium text-muted-foreground"
          >
            AI & Data Science Portfolio
          </p>

          {/* Typing effect */}
          <div
            className="intro-hero-details mt-6 text-lg sm:text-xl"
          >
            <span className="text-muted-foreground">Specializing in </span>
            <TypingEffect active={revealed} />
          </div>

          {/* Description */}
          <p
            className="intro-hero-details mt-8 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed"
          >
            I build practical AI and data projects with Python, SQL, dashboards,
            machine learning, and LLM-powered workflows. My focus is simple: turn
            raw information into clear products, insights, and decisions.
          </p>

          {/* CTA Buttons */}
          <div
            className="intro-hero-actions mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={scrollToProjects}
              className="group relative overflow-hidden bg-gradient-to-r from-primary to-accent text-primary-foreground px-8 py-6 text-lg hover:shadow-lg hover:shadow-primary/25 transition-shadow"
            >
              <span className="relative z-10 flex items-center gap-2">
                View Projects
                <ExternalLink className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>

            <Button size="lg"
              variant="outline"
              asChild
              className="group glass border-border/50 px-8 py-6 text-lg hover:bg-muted/50">
              <a href="/resume.pdf" download>
                <span className="flex items-center gap-2">
                  Download Resume
                  <Download className="h-5 w-5 transition-transform group-hover:translate-y-1" />
                </span>
              </a>
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="intro-hero-scroll absolute -bottom-20 left-1/2 -translate-x-1/2"
        >
          <motion.div
            initial={false}
            animate={{ y: revealed ? [0, 10, 0] : 0 }}
            transition={revealed ? { duration: 1.5, repeat: Infinity } : { duration: 0, delay: 0 }}
            className="flex flex-col items-center gap-2 text-muted-foreground"
          >
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <ArrowDown className="h-4 w-4" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
