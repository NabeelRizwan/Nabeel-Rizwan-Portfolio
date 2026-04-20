"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 400)
    const timer2 = setTimeout(() => setStage(2), 900)
    const timer3 = setTimeout(() => setStage(3), 1400)
    const timer4 = setTimeout(() => {
      onComplete()
    }, 2200)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [onComplete])

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background glow effects */}
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-primary/20 blur-3xl"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: stage >= 1 ? 2 : 0, opacity: stage >= 1 ? 0.5 : 0 }}
          transition={{ duration: 1.5 }}
        />
        <motion.div
          className="absolute w-64 h-64 rounded-full bg-accent/20 blur-3xl"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: stage >= 2 ? 1.5 : 0, opacity: stage >= 2 ? 0.4 : 0 }}
          transition={{ duration: 1.2, delay: 0.2 }}
        />

        <div className="relative">
          {/* Neural network nodes */}
          <motion.svg
            viewBox="0 0 200 200"
            className="h-56 w-56 md:h-72 md:w-72"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Glow filter */}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>

            {/* Central brain node */}
            <motion.circle
              cx="100"
              cy="100"
              r="10"
              fill="url(#nodeGradient)"
              filter="url(#glow)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: stage >= 0 ? 1 : 0, 
                opacity: stage >= 0 ? 1 : 0 
              }}
              transition={{ duration: 0.4, ease: "backOut" }}
            />

            {/* Inner ring nodes */}
            {[0, 60, 120, 180, 240, 300].map((angle, i) => {
              const x = 100 + 38 * Math.cos((angle * Math.PI) / 180)
              const y = 100 + 38 * Math.sin((angle * Math.PI) / 180)
              return (
                <motion.g key={`inner-${i}`}>
                  <motion.line
                    x1="100"
                    y1="100"
                    x2={x}
                    y2={y}
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    filter="url(#glow)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                      pathLength: stage >= 1 ? 1 : 0,
                      opacity: stage >= 1 ? 0.8 : 0,
                    }}
                    transition={{ duration: 0.35, delay: i * 0.04 }}
                  />
                  <motion.circle
                    cx={x}
                    cy={y}
                    r="5"
                    fill="#06b6d4"
                    filter="url(#glow)"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: stage >= 1 ? 1 : 0,
                      opacity: stage >= 1 ? 1 : 0,
                    }}
                    transition={{ duration: 0.3, delay: 0.15 + i * 0.04, ease: "backOut" }}
                  />
                </motion.g>
              )
            })}

            {/* Outer ring nodes */}
            {[30, 90, 150, 210, 270, 330].map((angle, i) => {
              const x = 100 + 70 * Math.cos((angle * Math.PI) / 180)
              const y = 100 + 70 * Math.sin((angle * Math.PI) / 180)
              const innerX = 100 + 38 * Math.cos(((angle - 30) * Math.PI) / 180)
              const innerY = 100 + 38 * Math.sin(((angle - 30) * Math.PI) / 180)
              return (
                <motion.g key={`outer-${i}`}>
                  <motion.line
                    x1={innerX}
                    y1={innerY}
                    x2={x}
                    y2={y}
                    stroke="#a855f7"
                    strokeWidth="1.5"
                    filter="url(#glow)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                      pathLength: stage >= 2 ? 1 : 0,
                      opacity: stage >= 2 ? 0.7 : 0,
                    }}
                    transition={{ duration: 0.3, delay: i * 0.03 }}
                  />
                  <motion.circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#a855f7"
                    filter="url(#glow)"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: stage >= 2 ? 1 : 0,
                      opacity: stage >= 2 ? 1 : 0,
                    }}
                    transition={{ duration: 0.25, delay: 0.1 + i * 0.03, ease: "backOut" }}
                  />
                </motion.g>
              )
            })}
            
            {/* Cross connections */}
            {stage >= 3 && [0, 120, 240].map((angle, i) => {
              const x1 = 100 + 38 * Math.cos((angle * Math.PI) / 180)
              const y1 = 100 + 38 * Math.sin((angle * Math.PI) / 180)
              const x2 = 100 + 38 * Math.cos(((angle + 120) * Math.PI) / 180)
              const y2 = 100 + 38 * Math.sin(((angle + 120) * Math.PI) / 180)
              return (
                <motion.line
                  key={`cross-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#06b6d4"
                  strokeWidth="1"
                  filter="url(#glow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.5 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                />
              )
            })}

            {/* Pulse effect */}
            <motion.circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="1.5"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{
                scale: [0.5, 1.1],
                opacity: [0.6, 0],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                repeatDelay: 0.3,
              }}
            />
            <motion.circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="#a855f7"
              strokeWidth="1"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{
                scale: [0.6, 1.15],
                opacity: [0.4, 0],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                repeatDelay: 0.3,
                delay: 0.4,
              }}
            />
          </motion.svg>

          {/* Loading text with typing effect */}
          <motion.div
            className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <motion.div className="flex items-center gap-2 justify-center">
              <span className="text-sm font-mono text-muted-foreground tracking-[0.2em]">
                INITIALIZING AI
              </span>
              <motion.span
                className="flex gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
