"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { Brain, Database, LineChart, Code2 } from "lucide-react"

const stats = [
  { label: "Projects Completed", value: 50, suffix: "+", icon: Code2 },
  { label: "ML Models Built", value: 35, suffix: "+", icon: Brain },
  { label: "Datasets Analyzed", value: 100, suffix: "+", icon: Database },
  { label: "Technologies", value: 25, suffix: "+", icon: LineChart },
]

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      const duration = 2000
      const steps = 60
      const stepValue = value / steps
      let current = 0

      const timer = setInterval(() => {
        current += stepValue
        if (current >= value) {
          setCount(value)
          clearInterval(timer)
        } else {
          setCount(Math.floor(current))
        }
      }, duration / steps)

      return () => clearInterval(timer)
    }
  }, [isInView, value])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
}

export function AboutSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="about" className="py-24 lg:py-32 relative">
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
              About Me
            </motion.span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
              Turning Data into{" "}
              <span className="text-gradient">Intelligence</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Profile card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="glass rounded-2xl p-8 lg:p-10">
                {/* Avatar placeholder */}
                <div className="flex items-start gap-6">
                  <div className="shrink-0">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent p-0.5">
                        <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                          <span className="text-3xl font-bold text-gradient">AC</span>
                        </div>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-card" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Alex Chen</h3>
                    <p className="text-primary font-medium">Senior Data Scientist</p>
                    <p className="text-muted-foreground text-sm mt-1">San Francisco, CA</p>
                  </div>
                </div>

                <div className="mt-8 space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    {"I'm a passionate data scientist and AI engineer with over 5 years of experience building machine learning systems that drive business impact."}
                  </p>
                  <p>
                    My expertise spans from traditional statistical methods to cutting-edge deep learning architectures. I specialize in natural language processing, computer vision, and predictive analytics.
                  </p>
                  <p>
                    When not training models, you can find me contributing to open-source ML projects, writing technical blog posts, or exploring the latest research papers.
                  </p>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-2xl" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-2xl" />
              </div>
            </motion.div>

            {/* Stats grid */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-2 gap-4"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="group glass rounded-xl p-6 hover:bg-muted/30 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold text-gradient">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
