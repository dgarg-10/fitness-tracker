import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { supabase } from '../services/supabase'
import type { AuthError } from '@supabase/supabase-js'

export default function Auth(){
    const[email, setEmail] = useState<string>('')
    const[password, setPassword] = useState<string>('')
    const[isLogin, setIsLogin] = useState<boolean>(true)
    const[error, setError] = useState<string | null>(null)
    const[loading, setLoading] = useState<boolean>(false)

    const handleSubmit = async (): Promise<void> => {
        setError(null)
        setLoading(false)

        const {error: authError}: {error: AuthError | null} =  isLogin 
        ? await supabase.auth.signInWithPassword({email, password})
        : await supabase.auth.signUp({email, password})

        if(authError) setError(authError.message)
        setLoading(false)
    }
    return (
        <div style={{ maxWidth: 400, margin: '100px auto', padding: 24 }}>
          <h2 style={{ marginBottom: 16 }}>
            {isLogin ? 'Log In' : 'Sign Up'}
          </h2>
          <input
            placeholder="Email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            style={{ display: 'block', marginBottom: 8, width: '100%', padding: 8 }}
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            style={{ display: 'block', marginBottom: 8, width: '100%', padding: 8 }}
          />
          {error && (
            <p style={{ color: 'red', marginBottom: 8 }}>{error}</p>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: '100%', padding: 10 }}
          >
            {loading ? 'Loading...' : isLogin ? 'Log In' : 'Sign Up'}
          </button>
          <p
            style={{ marginTop: 12, cursor: 'pointer', color: '#3b82f6' }}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Need an account? Sign up' : 'Have an account? Log in'}
          </p>
        </div>
      )
    }