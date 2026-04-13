'use client'

import React from 'react'
import { TopNav } from '@/components/nav/TopNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto max-w-7xl pt-20 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

