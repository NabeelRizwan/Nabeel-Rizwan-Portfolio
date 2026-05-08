"use client"

import { motion } from "framer-motion"
import { Github, Linkedin, Mail } from "lucide-react"

const socialLinks = [
  { name: "GitHub", icon: Github, href: "https://github.com/NabeelRizwan" },
  { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/in/mohammed-nabeel-rizwan" },
  { name: "Email", icon: Mail, href: "#contact" },
]

export function Footer() {
  return (
    <footer className="py-12 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <a href="#" className="text-xl font-bold tracking-tight">
              <span className="text-gradient">NR</span>
              <span className="text-muted-foreground">.data</span>
            </a>
            <p className="text-sm text-muted-foreground">
              AI, data analytics, and machine learning portfolio by Nabeel Rizwan
            </p>
            <p className="text-xs text-muted-foreground">
              (c) {new Date().getFullYear()} All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <a href="#about" className="hover:text-foreground transition-colors">
              About
            </a>
            <a href="#projects" className="hover:text-foreground transition-colors">
              Projects
            </a>
            <a href="#strengths" className="hover:text-foreground transition-colors">
              Strengths
            </a>
            <a href="#contact" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </div>

          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <motion.a
                key={social.name}
                href={social.href}
                target={social.href.startsWith("http") ? "_blank" : undefined}
                rel={social.href.startsWith("http") ? "noreferrer" : undefined}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg glass hover:bg-muted/50 transition-colors"
                aria-label={social.name}
              >
                <social.icon className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
