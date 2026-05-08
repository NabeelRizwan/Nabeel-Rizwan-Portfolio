"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Briefcase, GraduationCap, Award, BookOpen } from "lucide-react"

const timeline = [
  {
    type: "work",
    title: "AI & Data Portfolio",
    organization: "Independent Projects",
    location: "Remote",
    period: "2025 - Present",
    description: "Building hands-on projects across AI agents, chatbot products, stock analytics, dashboards, Python apps, and machine learning workflows.",
    icon: Briefcase,
  },
  {
    type: "work",
    title: "Machine Learning & LLM Practice",
    organization: "Self-Directed Learning",
    location: "Remote",
    period: "2024 - 2025",
    description: "Practicing supervised learning, model evaluation, feature engineering, NLP, LLM prompting, and practical model-to-app implementation.",
    icon: Briefcase,
  },
  {
    type: "education",
    title: "Data Science & Analytics Coursework",
    organization: "Python, SQL, Statistics, BI",
    location: "Online / Academic",
    period: "2024",
    description: "Focused on data cleaning, exploratory analysis, dashboards, hypothesis testing, regression, classification, and business reporting workflows.",
    icon: GraduationCap,
  },
  {
    type: "work",
    title: "Dashboard & Reporting Practice",
    organization: "Business Intelligence Projects",
    location: "Remote",
    period: "2024",
    description: "Created Excel and Power BI style reports with KPIs, trend charts, slicers, and business summaries for decision-focused datasets.",
    icon: Briefcase,
  },
  {
    type: "award",
    title: "Public Dataset Practice",
    organization: "Kaggle / Open Data",
    location: "Online",
    period: "2024",
    description: "Used open datasets to practice EDA, feature engineering, model comparison, and clear notebook documentation.",
    icon: Award,
  },
  {
    type: "education",
    title: "Core Technical Foundation",
    organization: "Programming and Analytics",
    location: "India",
    period: "Ongoing",
    description: "Developing a strong base in programming, database querying, statistics, visualization, and business communication.",
    icon: BookOpen,
  },
]

export function ExperienceSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="experience" className="py-24 lg:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent pointer-events-none" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="text-sm font-mono text-primary uppercase tracking-widest"
            >
              Career Path
            </motion.span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
              Experience & <span className="text-gradient">Education</span>
            </h2>
          </div>

          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-accent to-primary" />

            <div className="space-y-12">
              {timeline.map((item, index) => (
                <motion.div
                  key={`${item.title}-${index}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className={`relative flex items-start gap-6 md:gap-12 ${
                    index % 2 === 0 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : ""}`}>
                    <div className="glass rounded-2xl p-6 ml-12 md:ml-0">
                      <div className={`flex items-center gap-3 mb-2 ${index % 2 === 0 ? "md:justify-end" : ""}`}>
                        <span className="text-xs font-mono text-primary bg-primary/10 px-3 py-1 rounded-full">
                          {item.period}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                      <p className="text-primary font-medium">{item.organization}</p>
                      <p className="text-sm text-muted-foreground mb-3">{item.location}</p>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 z-10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent p-0.5">
                      <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:block flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
