import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'MockMate — Interview Prep for NU Students',
  description:
    'AI-powered mock interview platform built specifically for Northeastern Seattle students. Practice with real company patterns, get expert AI feedback, and connect with peer volunteers.',
  keywords: ['mock interview', 'Northeastern', 'MSIS', 'MSCS', 'co-op', 'internship', 'interview prep'],
  openGraph: {
    title: 'MockMate',
    description: 'AI-powered interview prep for Northeastern Seattle students',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}