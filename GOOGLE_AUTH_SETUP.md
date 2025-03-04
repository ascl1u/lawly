# Setting Up Google Authentication

This guide will help you set up Google authentication for your application.

## 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Navigate to "APIs & Services" > "OAuth consent screen".
4. Choose "External" user type and click "Create".
5. Fill in the required information:
   - App name
   - User support email
   - Developer contact information
6. Click "Save and Continue".
7. Skip adding scopes and click "Save and Continue".
8. Add test users if needed and click "Save and Continue".
9. Review your settings and click "Back to Dashboard".

## 2. Create OAuth Credentials

1. Navigate to "APIs & Services" > "Credentials".
2. Click "Create Credentials" > "OAuth client ID".
3. Select "Web application" as the application type.
4. Enter a name for your OAuth client.
5. Add authorized JavaScript origins:
   - For development: `http://localhost:3000`
   - For production: `https://yourdomain.com`
   - **Important**: You must add the exact origin from which your application will be accessed. This includes the protocol (http/https), domain, and port (if non-standard).
   - If you're using Vercel previews, you may need to add multiple origins (e.g., `https://your-project-git-main-username.vercel.app`).
6. Add authorized redirect URIs:
   - For development: `http://localhost:3000/api/auth/callback`
   - For production: `https://yourdomain.com/api/auth/callback`
   - Also add your Supabase project URL: `https://<your-project-ref>.supabase.co/auth/v1/callback`
7. Click "Create".
8. Note your Client ID and Client Secret.

## 3. Configure Supabase Auth

1. Go to your Supabase project dashboard.
2. Navigate to "Authentication" > "Providers".
3. Find "Google" in the list and enable it.
4. Enter your Google Client ID and Client Secret.
5. Save the changes.

## 4. Update Environment Variables

Add the following to your `.env.local` file:

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

For production deployments, make sure to add this environment variable to your hosting platform (e.g., Vercel).

## 5. Debugging Origin Issues

If you encounter the error "The given origin is not allowed for the given client ID", follow these steps:

1. Check the browser console to see the exact origin that's being used.
2. Verify that this exact origin is listed in the "Authorized JavaScript origins" in your Google Cloud Console.
3. Remember that origins are case-sensitive and must include the protocol (http/https).
4. After updating the origins in Google Cloud Console, it may take a few minutes for changes to propagate.
5. Clear your browser cache and cookies before testing again.

## 6. Testing

1. Start your application.
2. Navigate to the login page.
3. Click "Continue with Google" or wait for the Google One-Tap prompt.
4. Complete the Google authentication flow.
5. You should be redirected back to your application and logged in.

## Troubleshooting

- **Redirect URI Mismatch**: Ensure that the redirect URI in your Google Cloud Console matches the one used by Supabase.
- **CORS Issues**: Make sure your authorized JavaScript origins are correctly set.
- **One-Tap Not Appearing**: The One-Tap UI might not appear if the user has already dismissed it multiple times or if there are cookie restrictions in the browser.
- **FedCM Issues**: If you're having issues with FedCM (Chrome's replacement for third-party cookies), try setting `use_fedcm_for_prompt: false` in the Google One-Tap initialization.
- **Origin Mismatch**: If you see "The given origin is not allowed for the given client ID", check that your current domain is listed in the authorized JavaScript origins in Google Cloud Console. 