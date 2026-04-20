"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const skillCategories = [
  {
    title: "Programming Languages",
    skills: [
      { name: "Python", level: 95 },
      { name: "SQL", level: 90 },
      { name: "R", level: 80 },
      { name: "JavaScript", level: 75 },
    ],
  },
  {
    title: "Data Science Libraries",
    skills: [
      { name: "Pandas", level: 95 },
      { name: "NumPy", level: 95 },
      { name: "Scikit-learn", level: 90 },
      { name: "SciPy", level: 85 },
    ],
  },
  {
    title: "ML Frameworks",
    skills: [
      { name: "TensorFlow", level: 90 },
      { name: "PyTorch", level: 88 },
      { name: "Keras", level: 92 },
      { name: "Hugging Face", level: 85 },
    ],
  },
  {
    title: "Data Visualization",
    skills: [
      { name: "Matplotlib", level: 90 },
      { name: "Seaborn", level: 88 },
      { name: "Tableau", level: 85 },
      { name: "Power BI", level: 80 },
    ],
  },
  {
    title: "Development Tools",
    skills: [
      { name: "Git", level: 90 },
      { name: "Docker", level: 85 },
      { name: "Jupyter", level: 95 },
      { name: "VS Code", level: 90 },
    ],
  },
  {
    title: "Cloud & MLOps",
    skills: [
      { name: "AWS", level: 85 },
      { name: "GCP", level: 80 },
      { name: "MLflow", level: 82 },
      { name: "Kubernetes", level: 75 },
    ],
  },
]

function SkillBar({ name, level, delay }: { name: string; level: number; delay: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-foreground font-medium">{name}</span>
        <span className="text-muted-foreground">{level}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
          initial={{ width: 0 }}
          animate={isInView ? { width: `${level}%` } : {}}
          transition={{ duration: 1, delay, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}

export function SkillsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="skills" className="py-24 lg:py-32 relative">
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
              Technical Expertise
            </motion.span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
              Skills & <span className="text-gradient">Technologies</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              A comprehensive toolkit for building intelligent systems and extracting insights from data
            </p>
          </div>

          {/* Skills grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skillCategories.map((category, categoryIndex) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                className="group glass rounded-2xl p-6 hover:bg-muted/30 transition-all duration-300 hover:-translate-y-1"
              >
                <h3 className="text-lg font-semibold mb-6 text-gradient">
                  {category.title}
                </h3>
                <div className="space-y-4">
                  {category.skills.map((skill, skillIndex) => (
                    <SkillBar
                      key={skill.name}
                      name={skill.name}
                      level={skill.level}
                      delay={0.3 + categoryIndex * 0.1 + skillIndex * 0.05}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
