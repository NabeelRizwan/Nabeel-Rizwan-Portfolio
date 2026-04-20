"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowUpRight, Clock } from "lucide-react"

const posts = [
  {
    title: "Building Production-Ready ML Pipelines with MLflow",
    excerpt: "A comprehensive guide to implementing robust ML pipelines that scale from experimentation to production.",
    category: "MLOps",
    readTime: "8 min read",
    date: "Mar 5, 2026",
  },
  {
    title: "Transformers Explained: From Attention to GPT",
    excerpt: "Deep dive into the transformer architecture that powers modern NLP, from self-attention to large language models.",
    category: "Deep Learning",
    readTime: "12 min read",
    date: "Feb 28, 2026",
  },
  {
    title: "Feature Engineering for Time Series Forecasting",
    excerpt: "Essential techniques for extracting meaningful features from temporal data to improve forecast accuracy.",
    category: "Data Science",
    readTime: "6 min read",
    date: "Feb 15, 2026",
  },
]

export function BlogSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="blog" className="py-24 lg:py-32 relative">
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
              Insights
            </motion.span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
              Latest <span className="text-gradient">Articles</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Thoughts on machine learning, data science, and AI engineering
            </p>
          </div>

          {/* Blog posts */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <motion.article
                key={post.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="group glass rounded-2xl p-6 hover:bg-muted/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                {/* Category and read time */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-mono text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold mb-3 group-hover:text-gradient transition-all">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {post.excerpt}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{post.date}</span>
                  <span className="flex items-center gap-1 text-sm text-primary group-hover:underline">
                    Read More
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </motion.article>
            ))}
          </div>

          {/* View all link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 }}
            className="text-center mt-12"
          >
            <a
              href="#"
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
            >
              View All Articles
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
