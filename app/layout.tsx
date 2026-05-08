import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: '--font-space-grotesk'
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://nabeelrizwan.dev'),
  title: 'Nabeel Rizwan | AI & Data Science Portfolio',
  description: 'Portfolio of Nabeel Rizwan, focused on AI agents, data analytics, machine learning, dashboards, SQL, Python, and business insights.',
  keywords: ['Nabeel Rizwan', 'AI Developer', 'Data Analyst', 'Data Scientist', 'Machine Learning', 'Python', 'SQL', 'Power BI', 'AI Agents', 'Data Visualization'],
  authors: [{ name: 'Nabeel Rizwan' }],
  creator: 'Nabeel Rizwan',
  applicationName: 'Nabeel Rizwan Portfolio',
  openGraph: {
    title: 'Nabeel Rizwan | AI & Data Science Portfolio',
    description: 'Building practical AI workflows, dashboards, predictive models, and business-ready insights.',
    type: 'website',
    url: 'https://nabeelrizwan.dev',
    siteName: 'Nabeel Rizwan Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nabeel Rizwan | AI & Data Science Portfolio',
    description: 'Building practical AI workflows, dashboards, predictive models, and business-ready insights.',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a14',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
