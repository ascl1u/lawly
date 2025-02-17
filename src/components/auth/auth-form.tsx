import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

interface AuthFormProps {
  type: 'login' | 'signup'
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>
  error?: string
  loading?: boolean
}

export function AuthForm({ type, onSubmit, error, loading }: AuthFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md space-y-8 p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {type === 'login' ? 'Sign in to your account' : 'Create account'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {type === 'login' 
              ? "Don't have an account? " 
              : "Already have an account? "}
            <Link 
              href={type === 'login' ? '/auth/signup' : '/auth/login'}
              className="text-primary hover:underline"
            >
              {type === 'login' ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>

        {error && (
          <div className="text-sm text-red-500 text-center">
            {error}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Loading...' : type === 'login' ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  )
} 