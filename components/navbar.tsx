"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Experience", href: "#experience" },
  { name: "Strengths", href: "#strengths" },
  { name: "Contact", href: "#contact" },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const menuToggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (!isMobileMenuOpen) return
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      setIsMobileMenuOpen(false)
      menuToggleRef.current?.focus({ preventScroll: true })
    }
    const desktop = window.matchMedia("(min-width: 1024px)")
    const closeOnDesktop = () => { if (desktop.matches) setIsMobileMenuOpen(false) }
    window.addEventListener("keydown", onEscape)
    desktop.addEventListener("change", closeOnDesktop)
    return () => {
      window.removeEventListener("keydown", onEscape)
      desktop.removeEventListener("change", closeOnDesktop)
    }
  }, [isMobileMenuOpen])

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    if (isMobileMenuOpen) menuToggleRef.current?.focus({ preventScroll: true })
    setIsMobileMenuOpen(false)
  }

  return (
    <nav
      className={`intro-navigation fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? "glass py-3" : "py-6"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.a
            href="#"
            className="text-xl font-bold tracking-tight"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-gradient">NR</span>
            <span className="text-muted-foreground">.data</span>
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
              >
                {item.name}
              </button>
            ))}
            <Button
              onClick={() => scrollToSection("#contact")}
              className="ml-4 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            >
              Get in Touch
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            ref={menuToggleRef}
            className="lg:hidden p-2.5 rounded-lg text-foreground focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div id="mobile-navigation" hidden={!isMobileMenuOpen} className="lg:hidden">
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-4 pb-4 glass-strong rounded-xl max-h-[calc(100dvh-7rem)] overflow-y-auto"
          >
            <div className="flex flex-col gap-2 p-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="px-4 py-3 text-left text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                >
                  {item.name}
                </button>
              ))}
              <Button
                onClick={() => scrollToSection("#contact")}
                className="mt-2 bg-gradient-to-r from-primary to-accent"
              >
                Get in Touch
              </Button>
            </div>
          </motion.div>
        )}
        </div>
      </div>
    </nav>
  )
}
