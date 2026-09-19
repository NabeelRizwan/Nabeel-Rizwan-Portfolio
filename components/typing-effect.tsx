"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const skills = [
  "AI Agents",
  "LLM Applications",
  "Machine Learning",
  "Data Analytics",
  "SQL Reporting",
  "Power BI Dashboards",
  "Python Automation",
  "Exploratory Data Analysis",
  "Predictive Analytics",
  "Data Visualization",
  "Natural Language Processing",
  "Business Intelligence",
  "Streamlit Apps",
  "Statistical Analysis",
]

export function TypingEffect({ active = true }: { active?: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!active) return

    const currentSkill = skills[currentIndex]
    const isHolding = !isDeleting && displayText === currentSkill
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentSkill.length) {
          setDisplayText(currentSkill.slice(0, displayText.length + 1))
        } else {
          setIsDeleting(true)
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1))
        } else {
          setIsDeleting(false)
          setCurrentIndex((prev) => (prev + 1) % skills.length)
        }
      }
    }, isHolding ? 2000 : isDeleting ? 50 : 100)

    return () => clearTimeout(timeout)
  }, [active, displayText, isDeleting, currentIndex])

  return (
    <span className="inline-flex items-center">
      <AnimatePresence mode="wait">
        <motion.span
          key={displayText}
          className="text-gradient font-semibold"
          initial={active ? { opacity: 0.8 } : false}
          animate={{ opacity: 1 }}
        >
          {displayText}
        </motion.span>
      </AnimatePresence>
      <motion.span
        className="ml-1 inline-block h-8 w-0.5 bg-primary"
        initial={false}
        animate={{ opacity: active ? [1, 0] : 1 }}
        transition={active ? { duration: 0.5, repeat: Infinity, repeatType: "reverse" } : { duration: 0 }}
      />
    </span>
  )
}
