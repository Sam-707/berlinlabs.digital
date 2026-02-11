# Phase 2: Authentication Patterns

---

## Prompt 2A - Supabase Email/Password Auth

Add to foundation when basic authentication is needed.

---

## Requirements

Implement Supabase Authentication with email/password using the Supabase Auth Client (`@supabase/supabase-js`).

### Features Needed

- **Sign Up**: email + password → creates user, redirects to verification/onboarding
- **Sign In**: email + password → redirects to dashboard
- **Sign Out**: clear session, redirect to home
- **Session Management**: Use `supabase.auth.getSession()` and `onAuthStateChange()`
- **Password Reset**: Send reset email with Supabase's built-in flow

### Error Messages (Exact)

```typescript
const ERROR_MESSAGES = {
  invalidCredentials: "Email or password is incorrect",
  userExists: "An account with this email already exists",
  weakPassword: "Password should be at least 8 characters",
  general: "Something went wrong. Please try again."
}
```

### Auth Flow

```
Sign Up:
1. User submits email + password
2. Validate input
3. Call supabase.auth.signUp()
4. Check if email verification is enabled
5. Show success message or redirect to onboarding

Sign In:
1. User submits email + password
2. Validate input
3. Call supabase.auth.signInWithPassword()
4. On success, redirect to /dashboard
5. On error, show specific error message

Sign Out:
1. User clicks sign out
2. Call supabase.auth.signOut()
3. Clear local auth state
4. Redirect to home page

Password Reset:
1. User requests reset
2. Call supabase.auth.resetPasswordForEmail()
3. Show success message
4. User follows email link to Supabase's reset page
```

---

## Deliverables

### 1. Auth Utility Functions (lib/auth.ts)

```typescript
// src/lib/auth.ts
import { supabase } from './supabase'
import type { AuthError, User } from '@supabase/supabase-js'

export interface AuthResult {
  success: boolean
  error?: string
  user?: User
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      if (error.message.includes('already registered')) {
        return { success: false, error: 'An account with this email already exists' }
      }
      return { success: false, error: error.message }
    }

    return { success: true, user: data.user }
  } catch {
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: 'Email or password is incorrect' }
    }

    return { success: true, user: data.user }
  } catch {
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

export async function resetPassword(email: string): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch {
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
```

### 2. Login Page Component

```typescript
// src/pages/auth/LoginPage.tsx
import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signIn } from '../../lib/auth'
import { useAuth } from '../../contexts/AuthContext'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { refreshSession } = useAuth()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn(email, password)

    if (result.success) {
      await refreshSession()
      navigate('/dashboard')
    } else {
      setError(result.error || 'Something went wrong')
    }

    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Sign In</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link to="/auth/signup">Sign up</Link>
        </p>
        <p className="auth-footer">
          <Link to="/auth/forgot-password">Forgot password?</Link>
        </p>
      </div>
    </div>
  )
}
```

### 3. Signup Page Component

```typescript
// src/pages/auth/SignupPage.tsx
import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signUp } from '../../lib/auth'
import { useAuth } from '../../contexts/AuthContext'

export function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { refreshSession } = useAuth()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password should be at least 8 characters')
      return
    }

    setLoading(true)

    const result = await signUp(email, password)

    if (result.success) {
      await refreshSession()
      navigate('/dashboard')
    } else {
      setError(result.error || 'Something went wrong')
    }

    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Create Account</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/auth/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
```

### 4. Protected Route Wrapper

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  if (requireAdmin && profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
```

### 5. Session Context/Provider (AuthContext.tsx)

```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '../types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!error && data) {
      setProfile(data)
    }
  }

  async function refreshSession() {
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user ?? null)

    if (session?.user) {
      await fetchProfile(session.user.id)
    } else {
      setProfile(null)
    }
  }

  useEffect(() => {
    refreshSession().then(() => setLoading(false))

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }

        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

---

## What NOT to Do

- ❌ Use Firebase
- ❌ Use browser prompts (alert/confirm)
- ❌ Redesign existing UI (only wire up logic)
- ❌ Store passwords in plain text
- ❌ Store tokens in localStorage

---

## CSS Styles (src/pages/auth/auth.css)

```css
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.auth-container {
  width: 100%;
  max-width: 400px;
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.auth-container h1 {
  margin: 0 0 1.5rem;
  font-size: 1.75rem;
  text-align: center;
}

.error-message {
  background: var(--error);
  color: white;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent);
}

button[type="submit"] {
  width: 100%;
  padding: 0.875rem;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

button[type="submit"]:hover:not(:disabled) {
  background: var(--accent-hover);
}

button[type="submit"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-footer {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.auth-footer a {
  color: var(--accent);
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}
```

---

## Prompt 2B - Add Google OAuth

Add Google OAuth authentication to existing email/password auth.

---

## Requirements

- Add "Sign in with Google" button to login/signup pages
- Use `supabase.auth.signInWithOAuth({ provider: 'google' })`
- Handle OAuth callback
- Sync Google profile data to user profile (display_name, avatar_url)
- Check if user exists, create profile if first time

---

## Redirects

- Successful login → /dashboard
- Admin users → /admin

---

## Error Handling

```typescript
const OAuthError = "Sign in with Google failed. Please try again."
```

---

## Deliverables

### 1. Updated Login/Signup Pages with Google Button

```typescript
// Add to LoginPage.tsx
async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })

  if (error) {
    setError('Sign in with Google failed. Please try again.')
  }
}

// Add button to form
<button
  type="button"
  onClick={signInWithGoogle}
  className="google-button"
>
  <svg width="18" height="18" viewBox="0 0 18 18">
    {/* Google icon SVG */}
  </svg>
  Sign in with Google
</button>
```

### 2. OAuth Callback Handler

```typescript
// src/pages/auth/CallbackPage.tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export function CallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        // Check if user has profile, create if not
        if (session?.user) {
          createProfileIfNotExists(session.user)
        }
        navigate('/dashboard')
      }
    })
  }, [navigate])

  return <div className="loading">Completing sign in...</div>
}

async function createProfileIfNotExists(user: any) {
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!existing) {
    await supabase.from('profiles').insert({
      user_id: user.id,
      display_name: user.user_metadata.full_name || user.email?.split('@')[0],
      avatar_url: user.user_metadata.avatar_url,
      role: 'user',
    })
  }
}
```

### 3. Profile Sync on First Login

```typescript
// Update profile when user signs in with Google
async function syncGoogleProfile(user: any) {
  const metadata = user.user_metadata

  await supabase
    .from('profiles')
    .update({
      display_name: metadata.full_name,
      avatar_url: metadata.avatar_url,
    })
    .eq('user_id', user.id)
}
```

---

## OAuth Button CSS

```css
.google-button {
  width: 100%;
  padding: 0.75rem;
  background: white;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  transition: background 0.2s;
}

.google-button:hover {
  background: #f8f8f8;
}

.google-button svg {
  width: 18px;
  height: 18px;
}
```

---

## Next Steps

After implementing authentication:

1. **Build User Dashboard** → Go to [Phase 3A: User Dashboard](./phase-3-data-dashboard.md#prompt-3a-user-dashboard-data)
2. **Add Admin Panel** → Go to [Phase 3B: Admin Dashboard](./phase-3-data-dashboard.md#prompt-3b-admin-dashboard-data)
