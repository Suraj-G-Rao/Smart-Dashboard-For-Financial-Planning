import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Github, Sparkles, BookOpen } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">AI Finance Manager</span>
          </Link>
          <Button variant="outline" asChild>
            <Link href="/">← Back Home</Link>
          </Button>
        </div>
      </header>

      {/* About Content */}
      <section className="container mx-auto px-4 py-20 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">About Us</h1>
          <p className="text-xl text-gray-600">
            Reimagining personal finance management with AI and modern technology
          </p>
        </div>

        {/* Mission */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-blue-600" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              AI Finance Manager is a production-ready, containerized full-stack application
              designed to empower individuals with intelligent financial planning tools. We combine
              cutting-edge AI (Gemini & Groq), robust infrastructure (Supabase), and beautiful UX
              (shadcn/ui) to deliver a comprehensive finance management platform.
            </p>
          </CardContent>
        </Card>

        {/* Research Statement */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              Research & Innovation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Problem Statement</h3>
              <p className="text-gray-700">
                Traditional financial tools lack personalized insights and fail to optimize loan
                repayment strategies. Users struggle to visualize the long-term impact of
                prepayment strategies, credit card rewards optimization, and investment portfolio
                performance.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Our Approach</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <strong>Savings Optimizer:</strong> Advanced EMI calculator with multiple
                  prepayment strategies (extra EMIs, step-up, one-time prepayments) showing exact
                  interest saved and months reduced
                </li>
                <li>
                  <strong>Behavioral Nudges:</strong> AI-powered explanations using Gemini and Groq
                  to help users understand financial decisions without providing advisory
                </li>
                <li>
                  <strong>Rewards Engine:</strong> Credit card recommendation system that analyzes
                  spending patterns and reward rules to maximize cashback
                </li>
                <li>
                  <strong>Investment Analytics:</strong> Real-time P/L tracking, XIRR calculation,
                  and technical analysis (SMA, EMA, RSI) with contextual insights
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Technology Stack</h3>
              <p className="text-gray-700">
                Built on Next.js 14 (App Router), Supabase (Postgres + RLS + Auth + Storage +
                Edge Functions), TailwindCSS, shadcn/ui, Recharts, Motion One, and integrated with
                Gemini & Groq AI models. Fully containerized with Docker for production deployment.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Evaluation Plan</h3>
              <p className="text-gray-700">
                Success metrics include: accuracy of EMI calculations vs. bank statements,
                percentage of interest saved through optimizer recommendations, user engagement with
                AI insights, and system performance (sub-second API responses, 99.9% uptime).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* GitHub CTA */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="p-8 text-center">
            <Github className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Open Source & Contributions</h2>
            <p className="mb-6 opacity-90">
              This project is part of ongoing research in AI-driven financial tools. View the
              complete source code, architecture, and contribute to the project.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <a
                href="https://github.com/Suraj-G-Rao"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <Github className="h-5 w-5" />
                View on GitHub
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Team/Contact */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            For inquiries, collaborations, or technical questions, visit our{' '}
            <a
              href="https://github.com/Suraj-G-Rao"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              GitHub profile
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  )
}
