"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Briefcase, GraduationCap, Award, BookOpen } from "lucide-react"

const timeline = [
  {
    type: "work",
    title: "Senior Data Scientist",
    organization: "TechCorp AI",
    location: "San Francisco, CA",
    period: "2023 — Present",
    description: "Leading ML initiatives and building scalable AI solutions. Managing a team of 4 data scientists.",
    icon: Briefcase,
  },
  {
    type: "work",
    title: "Data Scientist",
    organization: "DataFlow Inc",
    location: "New York, NY",
    period: "2021 — 2023",
    description: "Developed predictive models and recommendation systems serving millions of users.",
    icon: Briefcase,
  },
  {
    type: "education",
    title: "M.S. in Computer Science",
    organization: "Stanford University",
    location: "Stanford, CA",
    period: "2019 — 2021",
    description: "Specialization in Machine Learning and AI. Published 3 research papers.",
    icon: GraduationCap,
  },
  {
    type: "work",
    title: "ML Engineering Intern",
    organization: "Google AI",
    location: "Mountain View, CA",
    period: "Summer 2020",
    description: "Worked on NLP models for Google Assistant. Contributed to production systems.",
    icon: Briefcase,
  },
  {
    type: "award",
    title: "Kaggle Grandmaster",
    organization: "Kaggle",
    location: "Online",
    period: "2020",
    description: "Achieved Grandmaster status with 5 gold medals in machine learning competitions.",
    icon: Award,
  },
  {
    type: "education",
    title: "B.S. in Data Science",
    organization: "UC Berkeley",
    location: "Berkeley, CA",
    period: "2015 — 2019",
    description: "Graduated with honors. Minor in Statistics. Dean's List all semesters.",
    icon: BookOpen,
  },
]

export function ExperienceSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="experience" className="py-24 lg:py-32 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent pointer-events-none" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
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
              Career Path
            </motion.span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
              Experience & <span className="text-gradient">Education</span>
            </h2>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-accent to-primary" />

            {/* Timeline items */}
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
                  {/* Content */}
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

                  {/* Icon */}
                  <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 z-10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent p-0.5">
                      <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </div>

                  {/* Empty space for alignment */}
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
