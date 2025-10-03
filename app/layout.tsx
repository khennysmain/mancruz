import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { LoadingScreen } from "@/components/loading-screen"

export const metadata: Metadata = {
  title: "Barangay Mancruz Report System",
  description: "Barangay Mancruz Complaint and Incident Reporting System - Daet, Camarines Norte",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mancruz Reports",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Barangay Mancruz Report System",
    title: "Barangay Mancruz Report System",
    description: "Barangay Mancruz Complaint and Incident Reporting System",
  },
  twitter: {
    card: "summary",
    title: "Barangay Mancruz Report System",
    description: "Barangay Mancruz Complaint and Incident Reporting System",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Mancruz Reports" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-sans">
        <LoadingScreen />
        {children}
      </body>
    </html>
  )
}
