"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts"

const areaData = [
  { month: "Jan", analysis: 40, sql: 24, dashboards: 20 },
  { month: "Feb", analysis: 46, sql: 30, dashboards: 26 },
  { month: "Mar", analysis: 52, sql: 38, dashboards: 34 },
  { month: "Apr", analysis: 60, sql: 45, dashboards: 42 },
  { month: "May", analysis: 66, sql: 54, dashboards: 50 },
  { month: "Jun", analysis: 74, sql: 62, dashboards: 58 },
]

const barData = [
  { name: "Churn", accuracy: 82 },
  { name: "Forecasting", accuracy: 78 },
  { name: "Sentiment", accuracy: 80 },
  { name: "Segmentation", accuracy: 76 },
  { name: "Anomaly", accuracy: 74 },
]

const radarData = [
  { subject: "Python", A: 88 },
  { subject: "SQL", A: 84 },
  { subject: "Power BI", A: 82 },
  { subject: "Statistics", A: 76 },
  { subject: "ML", A: 78 },
  { subject: "Reporting", A: 82 },
]

const lineData = [
  { day: "Mon", records: 1200 },
  { day: "Tue", records: 1800 },
  { day: "Wed", records: 2400 },
  { day: "Thu", records: 2100 },
  { day: "Fri", records: 2800 },
  { day: "Sat", records: 3200 },
  { day: "Sun", records: 2900 },
]

export function VisualizationsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="visualizations" className="py-24 lg:py-32 relative">
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
              Data Stories
            </motion.span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
              Data <span className="text-gradient">Visualizations</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Sample dashboard-style visuals showing analysis progress, model comparison, skill coverage, and data workflow scale
            </p>
          </div>

          {/* Charts grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Area chart */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold mb-4">AI, SQL & Dashboard Progress</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaData}>
                    <defs>
                      <linearGradient id="colorMl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorDl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorNlp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="month" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(20, 20, 30, 0.9)",
                        border: "1px solid #333",
                        borderRadius: "8px",
                      }}
                    />
                    <Area type="monotone" dataKey="analysis" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMl)" />
                    <Area type="monotone" dataKey="sql" stroke="#a855f7" fillOpacity={1} fill="url(#colorDl)" />
                    <Area type="monotone" dataKey="dashboards" stroke="#06b6d4" fillOpacity={1} fill="url(#colorNlp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Bar chart */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Model & Analytics Scores</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" stroke="#666" fontSize={12} domain={[0, 100]} />
                    <YAxis type="category" dataKey="name" stroke="#666" fontSize={12} width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(20, 20, 30, 0.9)",
                        border: "1px solid #333",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="accuracy"
                      fill="url(#barGradient)"
                      radius={[0, 4, 4, 0]}
                    />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Radar chart */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Skill Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#333" />
                    <PolarAngleAxis dataKey="subject" stroke="#666" fontSize={12} />
                    <Radar
                      name="Skills"
                      dataKey="A"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Line chart */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Records Processed in a Workflow</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="day" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(20, 20, 30, 0.9)",
                        border: "1px solid #333",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="records"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      dot={{ fill: "#06b6d4", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: "#06b6d4" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
