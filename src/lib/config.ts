import { createClient } from '@supabase/supabase-js'

interface Config {
  supabase: {
    url: string
    serviceRoleKey: string
    anonKey: string
  }
  environment: 'development' | 'production' | 'test'
}

function validateConfig(): Config {
  const requiredEnvVars = {
    'SUPABASE_URL': process.env.SUPABASE_URL,
    'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`)
    }
  }

  return {
    supabase: {
      url: process.env.SUPABASE_URL!,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    },
    environment: (process.env.NODE_ENV as Config['environment']) || 'development'
  }
}

console.log('Supabase Config:', {
  url: process.env.SUPABASE_URL,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 5) + '...',  // Only log first 5 chars for security
})

export const config = validateConfig()

export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
) 