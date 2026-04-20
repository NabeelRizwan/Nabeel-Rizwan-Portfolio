import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: '--font-space-grotesk'
});
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Alex Chen | Data Scientist & AI Engineer',
  description: 'Premium portfolio showcasing expertise in machine learning, deep learning, and AI engineering. Building intelligent systems that transform data into actionable insights.',
  keywords: ['Data Scientist', 'AI Engineer', 'Machine Learning', 'Deep Learning', 'Python', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision'],
  authors: [{ name: 'Alex Chen' }],
  openGraph: {
    title: 'Alex Chen | Data Scientist & AI Engineer',
    description: 'Building intelligent machine learning systems and transforming data into actionable insights.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alex Chen | Data Scientist & AI Engineer',
    description: 'Building intelligent machine learning systems and transforming data into actionable insights.',
  },
  generator: 'v0.app',
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
      <body className={`${spaceGrotesk.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
