"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { ExternalLink, Github, Bot, Gamepad2, GraduationCap, LineChart, BrainCircuit, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"

const projects = [
  {
    title: "MediSync AI",
    description: "A multi-agent healthcare AI concept powered by Gemini 2.5 Flash, showing structured reasoning, specialist-style agents, and responsible diagnostic support workflows.",
    icon: Stethoscope,
    tech: ["Jupyter", "Python", "Gemini", "Multi-Agent AI"],
    metrics: "Capstone-ready",
    github: "https://github.com/NabeelRizwan/MediSync-AI",
    demo: "",
    cta: "View Repo",
  },
  {
    title: "StockAI v2.0",
    description: "A deployed Python finance analytics app for stock research, market signals, and data-driven exploration through an accessible web interface.",
    icon: LineChart,
    tech: ["Python", "Render", "Finance", "Dashboards"],
    metrics: "Live demo",
    github: "https://github.com/NabeelRizwan/StockAI-ver2.0",
    demo: "https://stockai-ver2-0.onrender.com/",
    cta: "Live Demo",
  },
  {
    title: "Chatbot SaaS",
    description: "A Python AI chatbot SaaS project focused on conversational workflows, product-style architecture, and practical assistant experiences.",
    icon: Bot,
    tech: ["Python", "AI Chatbot", "SaaS", "APIs"],
    metrics: "Product build",
    github: "https://github.com/NabeelRizwan/Chatbot-Saas",
    demo: "",
    cta: "View Repo",
  },
  {
    title: "College Board to Dashboards",
    description: "A dashboard-focused analytics project turning education data into cleaner reporting, KPI views, and decision-ready summaries.",
    icon: GraduationCap,
    tech: ["Dashboards", "Excel", "Power BI", "Analytics"],
    metrics: "BI case study",
    github: "https://github.com/NabeelRizwan/Project-1---From-College-Board-To-Dashboards",
    demo: "",
    cta: "View Repo",
  },
  {
    title: "ML Web App",
    description: "A machine-learning-enabled web app for image upload, object detection, text detection, and result explanation.",
    icon: BrainCircuit,
    tech: ["ML", "Web App", "Computer Vision", "Python"],
    metrics: "ML workflow",
    github: "https://github.com/NabeelRizwan/building-a-machine-learning-enabled-web-app",
    demo: "",
    cta: "View Repo",
  },
  {
    title: "Snake Game",
    description: "A Python game project showing programming fundamentals, event handling, game loops, and simple user interaction.",
    icon: Gamepad2,
    tech: ["Python", "Game Logic", "UI", "Packaging"],
    metrics: "Fun build",
    github: "https://github.com/NabeelRizwan/snake-game",
    demo: "",
    cta: "View Repo",
  },
]

export function ProjectsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="projects" className="py-24 lg:py-32 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Section header */}
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="text-sm font-mono text-primary uppercase tracking-widest"
            >
              Featured Work
            </motion.span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
              Featured <span className="text-gradient">Projects</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Selected GitHub projects showing AI workflows, data products, deployed apps, dashboards, and Python fundamentals
            </p>
          </div>

          {/* Projects grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group glass rounded-2xl p-6 hover:bg-muted/30 transition-all duration-300 hover:-translate-y-2"
              >
                {/* Icon and metrics */}
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
                    <project.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-xs font-mono text-primary bg-primary/10 px-3 py-1 rounded-full whitespace-nowrap">
                    {project.metrics}
                  </span>
                </div>

                {/* Title and description */}
                <h3 className="text-xl font-semibold mb-2 group-hover:text-gradient transition-all">
                  {project.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {project.description}
                </p>

                {/* Tech stack */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="flex gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 glass border-border/50 hover:bg-muted/50"
                    asChild
                  >
                    <a href={project.github} target="_blank" rel="noreferrer">
                      <Github className="h-4 w-4 mr-2" />
                      Code
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    variant={project.demo ? "default" : "outline"}
                    className={`flex-1 ${
                      project.demo
                        ? "bg-gradient-to-r from-primary to-accent hover:opacity-90"
                        : "glass border-border/50 hover:bg-muted/50"
                    }`}
                    asChild
                  >
                    <a href={project.demo || project.github} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {project.demo ? "Demo" : project.cta}
                    </a>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* View more button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.8 }}
            className="text-center mt-12"
          >
            <Button size="lg" variant="outline" className="glass border-border/50 hover:bg-muted/50" asChild>
              <a href="https://github.com/NabeelRizwan" target="_blank" rel="noreferrer">
                View GitHub Profile
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
