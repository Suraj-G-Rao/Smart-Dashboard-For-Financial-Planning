'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Calculator,
  TrendingUp,
  CreditCard,
  Target,
  FileText,
  Sparkles,
  Shield,
  Zap,
  PieChart,
  ArrowRight,
  Github,
} from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const features = [
    {
      icon: Calculator,
      title: 'Smart EMI Calculator',
      description:
        'Calculate EMIs with advanced savings planner. Explore Home Loan and Other Loans strategies to save lakhs in interest.',
    },
    {
      icon: CreditCard,
      title: 'Credit Card Optimizer',
      description:
        'AI-powered recommendations to maximize rewards and cashback based on your spending patterns.',
    },
    {
      icon: TrendingUp,
      title: 'Investment Tracker',
      description:
        'Track stocks, mutual funds, ETFs with P/L, XIRR, and technical analysis insights.',
    },
    {
      icon: Target,
      title: 'Goals & Budgets',
      description:
        'Set financial goals, track budgets, and get personalized SIP recommendations to achieve them.',
    },
    {
      icon: Sparkles,
      title: 'AI Insights',
      description: 'Get intelligent explanations powered by Gemini and Groq for all your financial decisions.',
    },
    {
      icon: FileText,
      title: 'Smart Reports',
      description:
        'Generate monthly reports, export transactions, and receive automated email summaries.',
    },
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description: 'Row-level security with Supabase, encrypted data, and PII redaction for AI calls.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Built with Next.js 14, optimized queries, and serverless edge functions.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-finance dark:bg-gradient-finance-dark relative overflow-hidden">
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern opacity-50" />

      {/* Header */}
      <header className="glass border-b border-border/50 sticky top-0 z-50 relative">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">FinanceAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition">
              Features
            </Link>
            <Link href="/calculators" className="text-sm font-medium hover:text-primary transition">
              Calculators
            </Link>
            <Link href="/pricing" className="text-sm font-medium hover:text-primary transition">
              Pricing
            </Link>
            <Link href="/security" className="text-sm font-medium hover:text-primary transition">
              Security
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary transition">
              About
            </Link>
            <Link href="/login">
              <Button 
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative container mx-auto px-6 py-24 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Headline & CTAs */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              🚀 Production-Ready AI Finance Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Smarter Money.
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-indigo-600 bg-clip-text text-transparent">
                Calmer Life.
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-xl">
              Advanced EMI savings planner, AI-powered credit card optimizer, investment tracking with XIRR, and intelligent financial insights. Built for the modern Indian investor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-lg px-8 py-6 h-auto"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/calculators">
                <Button 
                  size="lg" 
                  variant="ghost"
                  className="text-lg px-8 py-6 h-auto border border-border/50"
                >
                  See Live Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Preview Cards */}
          <div className="relative hidden lg:block">
            <div className="grid gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {/* KPI Card */}
              <div className="glass-card rounded-2xl p-6 hover:shadow-glass-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Net Worth</span>
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div className="text-3xl font-bold mb-2">₹25,00,000</div>
                <div className="text-sm text-success">↑ +12.5% this month</div>
              </div>

              {/* Credit Card Tile */}
              <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-primary/10 to-accent/10 hover:shadow-glass-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <CreditCard className="h-6 w-6 text-primary" />
                  <span className="text-xs font-medium text-primary">Recommended</span>
                </div>
                <div className="text-sm font-medium mb-1">HDFC Regalia Gold</div>
                <div className="text-2xl font-bold">Save ₹1,250</div>
                <div className="text-xs text-muted-foreground mt-2">5% rewards on this purchase</div>
              </div>

              {/* Chart Preview */}
              <div className="glass-card rounded-2xl p-6 hover:shadow-glass-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Investment P/L</span>
                  <PieChart className="h-5 w-5 text-accent" />
                </div>
                <div className="h-20 flex items-end gap-2">
                  {[40, 60, 45, 70, 55, 80, 65].map((height, i) => (
                    <div 
                      key={i}
                      className="flex-1 bg-gradient-to-t from-primary to-accent rounded-t opacity-60"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
                <div className="text-sm text-success mt-2">+18.5% XIRR</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need</h2>
          <p className="text-xl text-muted-foreground">Comprehensive financial tools in one platform</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <Card 
              key={idx} 
              className="glass-card border border-border/50 hover:shadow-glass-lg transition-all duration-300 hover:-translate-y-1 group"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative container mx-auto px-6 py-16">
        <div className="glass-card rounded-3xl p-12 text-center">
          <div className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            🇮🇳 Built for India
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div>
              <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
              <p className="text-sm font-medium mb-1">Bank-Grade Security</p>
              <p className="text-xs text-muted-foreground">RLS + PII Redaction</p>
            </div>
            <div>
              <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
              <p className="text-sm font-medium mb-1">AI-Powered Insights</p>
              <p className="text-xs text-muted-foreground">Gemini + Groq</p>
            </div>
            <div>
              <Zap className="h-8 w-8 text-primary mx-auto mb-3" />
              <p className="text-sm font-medium mb-1">Lightning Fast</p>
              <p className="text-xs text-muted-foreground">Next.js 14 + Edge</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">Start Optimizing Today</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands making smarter financial decisions with AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-lg px-8 py-6 h-auto"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 py-6 h-auto"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Features */}
      <section className="relative py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Enterprise-Ready Platform</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Built with security, compliance, and scalability at its core
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Bank-Grade Security</h3>
                <p className="text-muted-foreground mb-4">
                  End-to-end encryption, PCI DSS compliance, and AI-powered fraud detection
                </p>
                <Link href="/security" className="text-blue-600 hover:text-blue-700 font-medium">
                  Learn More →
                </Link>
              </CardContent>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <PieChart className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Flexible Pricing</h3>
                <p className="text-muted-foreground mb-4">
                  From free starter plans to enterprise solutions with custom pricing
                </p>
                <Link href="/pricing" className="text-green-600 hover:text-green-700 font-medium">
                  View Plans →
                </Link>
              </CardContent>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <Zap className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Smart Tools</h3>
                <p className="text-muted-foreground mb-4">
                  Advanced calculators, budget optimization, and AI-powered insights
                </p>
                <Link href="/calculators" className="text-purple-600 hover:text-purple-700 font-medium">
                  Try Now →
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border/50 mt-16">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold">FinanceAI</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm">
                Production-ready AI finance manager with EMI savings planner, credit card optimizer, and investment tracking. Built for the modern Indian investor.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-primary transition">Features</Link></li>
                <li><Link href="/calculators" className="hover:text-primary transition">Calculators</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition">Pricing</Link></li>
                <li><Link href="/security" className="hover:text-primary transition">Security</Link></li>
                <li><Link href="/about" className="hover:text-primary transition">About</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary transition">Research</Link></li>
                <li>
                  <a 
                    href="https://github.com/Suraj-G-Rao" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary transition inline-flex items-center gap-1"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
            <p>Built with Next.js 14, Supabase, Gemini & Groq • 2024 FinanceAI</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
