import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Airtifact - agentic static site deployment',
    template: '%s | Airtifact',
  },
  description:
    'Airtifact is the universal, open-source deployment layer and artifact preview hub for AI coding agents. Upload static sites via drag-and-drop or let AI assistants deploy live preview links via MCP.',
  keywords: [
    'Airtifact',
    'static site deployment',
    'AI coding agent',
    'MCP server',
    'Model Context Protocol',
    'static website hosting',
    'ZIP upload',
    'preview link',
    'Vercel Blob',
    'Claude Code',
    'Cursor',
    'Windsurf',
    'open-source deployment',
    'artifact hosting',
  ],
  authors: [{ name: 'Airtifact', url: 'https://airtifact.page' }],
  metadataBase: new URL('https://airtifact.page'),
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Airtifact',
    title: 'Airtifact - agentic static site deployment',
    description:
      'Upload static sites via drag-and-drop or let AI agents deploy live preview links directly from their workspace via MCP.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Airtifact - agentic static site deployment',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Airtifact - agentic static site deployment',
    description:
      'Upload static sites via drag-and-drop or let AI agents deploy live preview links directly from their workspace via MCP.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
  alternates: {
    canonical: '/',
  },
}

// Inline script runs before first paint to apply .dark on <html> without flash.
// Reads localStorage 'theme' key, falls back to prefers-color-scheme.
const darkModeScript = [
  '(function(){',
  "  try {",
  "    var t = localStorage.getItem('theme');",
  "    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;",
  "    if (t === 'dark' || (t === null && prefersDark)) {",
  "      document.documentElement.classList.add('dark');",
  "    }",
  "  } catch (e) {}",
  '})();',
].join('\n');

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: darkModeScript }} />
      </head>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
