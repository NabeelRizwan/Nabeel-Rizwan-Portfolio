"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { ExternalLink, Github, TrendingUp, Users, Brain, MessageSquare, ShieldCheck, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

const projects = [
  {
    title: "Customer Churn Prediction",
    description: "Built a gradient boosting model to predict customer churn with 94% accuracy, helping reduce customer attrition by 23%.",
    icon: Users,
    tech: ["Python", "XGBoost", "SHAP", "Streamlit"],
    metrics: "94% Accuracy",
    github: "#",
    demo: "#",
  },
  {
    title: "Recommendation Engine",
    description: "Developed a hybrid collaborative filtering system serving 10M+ users, increasing engagement by 35%.",
    icon: Brain,
    tech: ["PyTorch", "Redis", "FastAPI", "AWS"],
    metrics: "35% Engagement Boost",
    github: "#",
    demo: "#",
  },
  {
    title: "Stock Price Forecasting",
    description: "Time series forecasting using LSTM networks to predict stock movements with integrated sentiment analysis.",
    icon: TrendingUp,
    tech: ["TensorFlow", "NLTK", "PostgreSQL", "Docker"],
    metrics: "Real-time Predictions",
    github: "#",
    demo: "#",
  },
  {
    title: "Sentiment Analysis Tool",
    description: "NLP pipeline processing 100K+ social media posts daily for brand sentiment monitoring.",
    icon: MessageSquare,
    tech: ["Transformers", "spaCy", "Kafka", "Elasticsearch"],
    metrics: "100K+ Posts/Day",
    github: "#",
    demo: "#",
  },
  {
    title: "Fraud Detection System",
    description: "Real-time anomaly detection system reducing fraudulent transactions by 67% using ensemble methods.",
    icon: ShieldCheck,
    tech: ["Scikit-learn", "Apache Spark", "MLflow", "GCP"],
    metrics: "67% Fraud Reduction",
    github: "#",
    demo: "#",
  },
  {
    title: "Sales Forecasting Dashboard",
    description: "Interactive forecasting dashboard with automated model retraining and confidence intervals.",
    icon: BarChart3,
    tech: ["Prophet", "Plotly", "Dash", "Azure"],
    metrics: "15% Forecast Improvement",
    github: "#",
    demo: "#",
  },
]

export function ProjectsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="projects" className="py-24 lg:py-32 relative">
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
              Featured Work
            </motion.span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
              Machine Learning <span className="text-gradient">Projects</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              A selection of data science and machine learning projects demonstrating end-to-end ML solutions
            </p>
          </div>

          {/* Projects grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group glass rounded-2xl p-6 hover:bg-muted/30 transition-all duration-300 hover:-translate-y-2"
              >
                {/* Icon and metrics */}
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
                    <project.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-xs font-mono text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {project.metrics}
                  </span>
                </div>

                {/* Title and description */}
                <h3 className="text-xl font-semibold mb-2 group-hover:text-gradient transition-all">
                  {project.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {project.description}
                </p>

                {/* Tech stack */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="flex gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 glass border-border/50 hover:bg-muted/50"
                    asChild
                  >
                    <a href={project.github}>
                      <Github className="h-4 w-4 mr-2" />
                      Code
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    asChild
                  >
                    <a href={project.demo}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Demo
                    </a>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* View more button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.8 }}
            className="text-center mt-12"
          >
            <Button
              size="lg"
              variant="outline"
              className="glass border-border/50 hover:bg-muted/50"
            >
              View All Projects
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
