'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

function SignUpForm() {
  const supabase = createClientComponentClient()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/upload'
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(undefined)
    setLoading(true)

    try {
      const { error: checkError } = await supabase.auth.resetPasswordForEmail(email)

      if (!checkError) {
        setError('An account with this email already exists')
        setLoading(false)
        return
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTo}`
        }
      })

      if (signUpError) throw signUpError
      setError('Please check your email to verify your account')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred during sign up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md space-y-8 p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to create an account
          </p>
        </div>

        <Form onSubmit={handleSignUp} className="space-y-4">
          <FormField
            name="email"
            value={email}
            error={error}
            onChange={setEmail}
          >
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            name="password"
            value={password}
            error={error}
            onChange={setPassword}
          >
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </Form>

        <div className="text-center text-sm">
          <Link 
            href="/auth/login" 
            className="text-primary hover:text-primary/90"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default function SignUpPage() {
  return <SignUpForm />
} 