import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { supabase } from '../services/supabase'
import type { AuthError } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'


export default function Auth(){
    const[email, setEmail] = useState<string>('')
    const[password, setPassword] = useState<string>('')
    const[isLogin, setIsLogin] = useState<boolean>(true)
    const[error, setError] = useState<string | null>(null)
    const[loading, setLoading] = useState<boolean>(false)
    const navigate = useNavigate()

    const handleSubmit = async (): Promise<void> => {
        setError(null)
        setLoading(true)

        const {error: authError}: {error: AuthError | null} =  isLogin 
        ? await supabase.auth.signInWithPassword({email, password})
        : await supabase.auth.signUp({email, password})

        if(authError) {
          setError(authError.message)
        } else {
          navigate('/')
        }
        
        setLoading(false)
    }
    return (
        <div style={{
          maxWidth: 400,
          margin: '100px auto',
          padding: 24,
          background: '#17171a',
          border: '1px solid #26262a',
          borderRadius: 12
        }}>
          <h2 style={{ marginBottom: 16, color: '#f4f4f5' }}>
            {isLogin ? 'Log In' : 'Sign Up'}
          </h2>
          <input
            placeholder="Email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            style={{
              display: 'block',
              marginBottom: 8,
              width: '100%',
              padding: 8,
              background: '#1c1c1f',
              color: '#f4f4f5',
              border: '1px solid #3f3f46',
              borderRadius: 8
            }}
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            style={{
              display: 'block',
              marginBottom: 8,
              width: '100%',
              padding: 8,
              background: '#1c1c1f',
              color: '#f4f4f5',
              border: '1px solid #3f3f46',
              borderRadius: 8
            }}
          />
          {error && (
            <p style={{ color: '#f87171', marginBottom: 8 }}>{error}</p>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              padding: 10,
              background: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600
            }}
          >
            {loading ? 'Loading...' : isLogin ? 'Log In' : 'Sign Up'}
          </button>
          <p
            style={{ marginTop: 12, cursor: 'pointer', color: '#60a5fa' }}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Need an account? Sign up' : 'Have an account? Log in'}
          </p>
        </div>
      )
    }