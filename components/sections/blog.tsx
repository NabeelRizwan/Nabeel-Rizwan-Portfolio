"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { BrainCircuit, ChartNoAxesCombined, Code2 } from "lucide-react"

const capabilities = [
  {
    title: "Analysis to Insight",
    description: "Clean data, explore patterns, define KPIs, and turn findings into clear recommendations for business or product decisions.",
    icon: BrainCircuit,
    tools: ["Python", "SQL", "Excel", "EDA"],
  },
  {
    title: "Dashboard Delivery",
    description: "Build reporting views that make trends, comparisons, and operational metrics easy to scan and discuss with stakeholders.",
    icon: ChartNoAxesCombined,
    tools: ["Power BI", "Plotly", "Matplotlib", "KPIs"],
  },
  {
    title: "AI Prototyping",
    description: "Create practical AI and ML workflows, from notebooks and model experiments to small deployed apps and LLM-powered tools.",
    icon: Code2,
    tools: ["Scikit-learn", "LLMs", "APIs", "Render"],
  },
]

export function ProfessionalFocusSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="strengths" className="py-24 lg:py-32 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
              Role Fit
            </motion.span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
              Practical <span className="text-gradient">AI & Data Execution</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              A focused mix of analytics, machine learning, and implementation skills for entry-level data, BI, and AI roles.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {capabilities.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="group glass rounded-2xl p-6 hover:bg-muted/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 w-fit mb-5">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-gradient transition-all">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.tools.map((tool) => (
                    <span
                      key={tool}
                      className="text-xs px-2.5 py-1 rounded-md bg-muted text-muted-foreground"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
