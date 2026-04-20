"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const skills = [
  "Machine Learning",
  "Deep Learning",
  "Artificial Intelligence",
  "Data Visualization",
  "Natural Language Processing",
  "Predictive Analytics",
  "Computer Vision",
  "Neural Networks",
]

export function TypingEffect() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentSkill = skills[currentIndex]
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentSkill.length) {
          setDisplayText(currentSkill.slice(0, displayText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1))
        } else {
          setIsDeleting(false)
          setCurrentIndex((prev) => (prev + 1) % skills.length)
        }
      }
    }, isDeleting ? 50 : 100)

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, currentIndex])

  return (
    <span className="inline-flex items-center">
      <AnimatePresence mode="wait">
        <motion.span
          key={displayText}
          className="text-gradient font-semibold"
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
        >
          {displayText}
        </motion.span>
      </AnimatePresence>
      <motion.span
        className="ml-1 inline-block h-8 w-0.5 bg-primary"
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
      />
    </span>
  )
}
