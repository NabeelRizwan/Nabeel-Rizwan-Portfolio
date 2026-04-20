"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Send, Github, Linkedin, Twitter, Mail, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// Custom Kaggle icon component
function KaggleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.825 23.859c-.022.092-.117.141-.281.141h-3.139c-.187 0-.351-.082-.492-.248l-5.178-6.589-1.448 1.374v5.111c0 .235-.117.352-.351.352H5.505c-.236 0-.354-.117-.354-.352V.353c0-.233.118-.353.354-.353h2.431c.234 0 .351.12.351.353v14.343l6.203-6.272c.165-.165.33-.246.495-.246h3.239c.144 0 .236.06.281.18.046.149.034.255-.036.315l-6.555 6.344 6.836 8.507c.095.104.117.208.075.339" />
    </svg>
  )
}

const socialLinks = [
  { name: "GitHub", icon: Github, href: "#", username: "@alexchen" },
  { name: "LinkedIn", icon: Linkedin, href: "#", username: "alexchen" },
  { name: "Twitter", icon: Twitter, href: "#", username: "@alexchen_ml" },
  { name: "Kaggle", icon: KaggleIcon, href: "#", username: "alexchen" },
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
    // Handle form submission - you can integrate with your backend or email service
    alert("Thank you for your message! I'll get back to you soon.")
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
              Have a project in mind or want to discuss data science opportunities? {"I'd"} love to hear from you.
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
                      placeholder="Tell me about your project..."
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
                    <p className="text-muted-foreground">alex@example.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Location</h3>
                    <p className="text-muted-foreground">San Francisco, CA</p>
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
                  Currently open to full-time roles and consulting opportunities
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
