export const AUTH_COOKIE_NAMES = {
  ACCESS_TOKEN: 'sb-access-token',
  REFRESH_TOKEN: 'sb-refresh-token',
  AUTH_TOKEN: `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0]}-auth-token`
} as const 

export const AUTH_COOKIE_CONFIG = {
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: 'lax' as const,
  // Don't use domain prefix (.) for localhost
  domain: process.env.NODE_ENV === 'production' 
    ? process.env.COOKIE_DOMAIN || undefined
    : undefined
} 