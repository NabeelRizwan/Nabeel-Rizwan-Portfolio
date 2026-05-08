"use client"

import { motion } from "framer-motion"
import { ArrowDown, Download, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TypingEffect } from "@/components/typing-effect"
import { NeuralBrain } from "@/components/neural-brain"

export function HeroSection() {
  const scrollToProjects = () => {
    const element = document.querySelector("#projects")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 3D Background */}
      <NeuralBrain />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background pointer-events-none opacity-50" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-sm text-muted-foreground">
              Open to AI, Data Analyst, BI Analyst, and Junior Data Scientist Roles
            </span>
          </motion.div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
            <span className="block mb-2">{"Hi, I'm"}</span>
            <span className="text-gradient">Nabeel Rizwan</span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-xl sm:text-2xl md:text-3xl font-medium text-muted-foreground"
          >
            AI & Data Science Portfolio
          </motion.p>

          {/* Typing effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-lg sm:text-xl"
          >
            <span className="text-muted-foreground">Specializing in </span>
            <TypingEffect />
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed"
          >
            I build practical AI and data projects with Python, SQL, dashboards,
            machine learning, and LLM-powered workflows. My focus is simple: turn
            raw information into clear products, insights, and decisions.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
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
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-muted-foreground"
          >
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <ArrowDown className="h-4 w-4" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
