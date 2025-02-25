export const AUTH_COOKIE_NAMES = {
  ACCESS_TOKEN: 'sb-access-token',
  REFRESH_TOKEN: 'sb-refresh-token',
  AUTH_TOKEN: `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0]}-auth-token`
} as const 