'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Sparkles, Mail, Lock, Shield, TrendingUp, CreditCard, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard'
  const { toast } = useToast()
  const supabase = createSupabaseClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [currentBenefit, setCurrentBenefit] = useState(0)

  const benefits = [
    'Save lakhs in interest with smart EMI strategies',
    'Maximize credit card rewards automatically',
    'Track investments with real-time P/L & XIRR',
  ]

  // Rotate benefits every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBenefit((prev) => (prev + 1) % benefits.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.session) {
        console.log('Login successful, session created')
        console.log('Redirecting to:', callbackUrl)

        toast({
          title: 'Success!',
          description: 'Logged in successfully',
        })

        // Wait a moment for session to be set in cookies, then redirect
        await new Promise(resolve => setTimeout(resolve, 500))

        // Use window.location for full page reload (picks up cookies)
        window.location.href = callbackUrl
      } else {
        throw new Error('No session created')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to login',
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}${callbackUrl}`,
        },
      })

      if (error) throw error

      if (data.user && !data.session) {
        toast({
          title: 'Check your email!',
          description: 'We sent you a confirmation link to complete registration',
        })
        setLoading(false)
      } else if (data.session) {
        toast({
          title: 'Success!',
          description: 'Account created successfully',
        })

        // Wait a moment for session to be set, then redirect
        await new Promise(resolve => setTimeout(resolve, 100))

        // Use window.location for more reliable redirect
        window.location.href = callbackUrl
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create account',
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${callbackUrl}`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to login with Google',
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-finance dark:bg-gradient-finance-dark relative overflow-hidden">
      {/* Grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-30" />

      {/* Back to Home */}
      <div className="absolute top-4 left-4 z-10">
        <Button variant="ghost" onClick={() => router.push('/')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </div>

      <div className="relative min-h-screen grid lg:grid-cols-2">
        {/* Left Side: Illustration & Benefits */}
        <div className="hidden lg:flex flex-col justify-center p-12 relative">
          <div className="max-w-md space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-bold">FinanceAI</span>
            </div>

            <div>
              <h2 className="text-4xl font-bold mb-4">
                Financial Intelligence
                <br />
                <span className="bg-gradient-to-r from-primary via-accent to-indigo-600 bg-clip-text text-transparent">
                  At Your Fingertips
                </span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Join thousands of smart investors managing their finances with AI-powered insights
              </p>
            </div>

            {/* Animated Benefits */}
            <div className="space-y-4">
              {benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 transition-all duration-500 ${currentBenefit === idx ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                    } ${currentBenefit === idx ? 'block' : 'hidden'}`}
                >
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {idx === 0 && <TrendingUp className="h-5 w-5 text-primary" />}
                    {idx === 1 && <CreditCard className="h-5 w-5 text-primary" />}
                    {idx === 2 && <Sparkles className="h-5 w-5 text-primary" />}
                  </div>
                  <p className="text-sm font-medium">{benefit}</p>
                </div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-6 pt-8 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">PII Safe</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">RLS Enabled</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Bank Grade</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card */}
        <div className="flex items-center justify-center p-6 lg:p-12 relative">
          <div className="w-full max-w-md">
            <Card className="glass-card border border-border/50 shadow-glass-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">
                  {isRegister ? 'Create Account' : 'Welcome back'} 👋
                </CardTitle>
                <CardDescription>
                  {isRegister ? 'Sign up for a new account' : 'Sign in to your account'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      {!isRegister && (
                        <Link
                          href="/auth/forgot-password"
                          className="text-sm text-primary hover:underline"
                        >
                          Forgot?
                        </Link>
                      )}
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder={isRegister ? "Create a strong password" : "Enter your password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      isRegister ? 'Creating Account...' : 'Signing In...'
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        {isRegister ? 'Create Account' : 'Sign In'}
                      </>
                    )}
                  </Button>
                </form>

                <div className="text-center mt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsRegister(!isRegister)}
                    className="text-sm"
                  >
                    {isRegister
                      ? 'Already have an account? Sign in'
                      : "Don't have an account? Sign up"
                    }
                  </Button>
                </div>

                {/* Demo Account Info */}
                {!isRegister && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-1">🎉 Test Account</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Email: demo@financeai.com | Password: demo123
                    </p>
                  </div>
                )}

                <div className="mt-6 text-center text-xs text-muted-foreground">
                  By continuing, you agree to our{' '}
                  <Link href="/terms" className="underline hover:text-primary">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="underline hover:text-primary">
                    Privacy Policy
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
