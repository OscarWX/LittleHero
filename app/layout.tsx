import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { SupabaseProvider } from '@/components/supabase-provider'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export const metadata: Metadata = {
  title: "Little Hero",
  description: "Turn your child into the hero of their own story",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Server-side session check
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <SupabaseProvider initialSession={session}>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  )
}
