'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'

export function SupabaseTest() {
  const [status, setStatus] = useState<string>('Not tested')
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setStatus('Testing...')

    try {
      // Test 1: Check environment variables
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!url || !key) {
        setStatus(`❌ Missing env vars: URL=${!!url}, KEY=${!!key}`)
        return
      }

      if (!url.includes('.supabase.co')) {
        setStatus(`❌ Invalid URL format: ${url}`)
        return
      }

      // Test 2: Basic connection
      const { data, error } = await supabase.from('users').select('count').limit(1)
      
      if (error) {
        setStatus(`❌ Connection failed: ${error.message}`)
        return
      }

      // Test 3: Auth service
      const { data: session } = await supabase.auth.getSession()
      
      setStatus(`✅ Connected! Session: ${session.session ? 'Active' : 'None'}`)
      
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testEmailOTP = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: 'test@example.com',
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })
      
      if (error) {
        setStatus(`❌ Email OTP failed: ${error.message}`)
      } else {
        setStatus(`✅ Email OTP works (test email sent)`)
      }
    } catch (error: any) {
      setStatus(`❌ Email OTP error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testGoogleAuth = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })
      
      if (error) {
        setStatus(`❌ Google auth failed: ${error.message}`)
      } else {
        setStatus(`✅ Google auth initiated (should redirect)`)
      }
    } catch (error: any) {
      setStatus(`❌ Google auth error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <strong>Status:</strong> {status}
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={testConnection} 
            disabled={loading}
            className="w-full"
          >
            Test Connection
          </Button>
          
          <Button 
            onClick={testEmailOTP} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            Test Email OTP
          </Button>
          
          <Button 
            onClick={testGoogleAuth} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            Test Google Auth
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <div>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Missing'}</div>
          <div>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}</div>
        </div>
      </CardContent>
    </Card>
  )
}
