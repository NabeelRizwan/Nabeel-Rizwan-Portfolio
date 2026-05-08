"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Send, Github, Linkedin, Mail, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const socialLinks = [
  { name: "GitHub", icon: Github, href: "https://github.com/NabeelRizwan", username: "NabeelRizwan" },
  { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/in/mohammed-nabeel-rizwan", username: "mohammed-nabeel-rizwan" },
]

export function ContactSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Portfolio contact from ${formState.name}`)
    const body = encodeURIComponent(`${formState.message}\n\nFrom: ${formState.name} <${formState.email}>`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
    setFormState({ name: "", email: "", message: "" })
  }

  return (
    <section id="contact" className="py-24 lg:py-32 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-background pointer-events-none" />

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
              Get in Touch
            </motion.span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
              {"Let's"} <span className="text-gradient">Connect</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Hiring for AI, analytics, BI, or junior data science roles? {"I'd"} be glad to connect.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="glass border-border/50 bg-muted/30 focus:bg-muted/50"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="glass border-border/50 bg-muted/30 focus:bg-muted/50"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Tell me about the role or project..."
                      rows={5}
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      className="glass border-border/50 bg-muted/30 focus:bg-muted/50 resize-none"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  Send Message
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </motion.div>

            {/* Contact info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-8"
            >
              {/* Info cards */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-muted-foreground">Use the form to open your email app</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Location</h3>
                    <p className="text-muted-foreground">India</p>
                  </div>
                </div>
              </div>

              {/* Social links */}
              <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold mb-4">Connect with me</h3>
                <div className="space-y-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target={social.href.startsWith("http") ? "_blank" : undefined}
                      rel={social.href.startsWith("http") ? "noreferrer" : undefined}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-muted group-hover:bg-gradient-to-br group-hover:from-primary/20 group-hover:to-accent/20 transition-colors">
                        <social.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{social.name}</p>
                        <p className="text-sm text-muted-foreground">{social.username}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Availability badge */}
              <div className="glass rounded-2xl p-6 text-center">
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                  </span>
                  <span className="font-semibold text-green-500">Available for Work</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Currently open to internships, entry-level AI/data roles, and analytics project work
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
