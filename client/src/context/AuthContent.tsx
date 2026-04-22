import {
    createContext,
    useContext,
    useEffect,
    useState
  } from 'react'
  import type { ReactNode } from 'react'
  import type { User } from '@supabase/supabase-js'
  import { supabase } from '../services/supabase'
  
  interface AuthContextType {
    user: User | null
    loading: boolean
    signOut: () => Promise<void>
  }
  
  const AuthContext = createContext<AuthContextType | undefined>(undefined)
  
  export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
  
    useEffect(() => {
      supabase.auth.getSession().then(({ data }) => {
        setUser(data.session?.user ?? null)
        setLoading(false)
      })
  
      const { data: listener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user ?? null)
        }
      )
  
      return () => listener.subscription.unsubscribe()
    }, [])
  
    const signOut = async (): Promise<void> => {
      await supabase.auth.signOut()
    }
  
    return (
      <AuthContext.Provider value={{ user, loading, signOut }}>
        {!loading && children}
      </AuthContext.Provider>
    )
  }
  
  export function useAuth(): AuthContextType {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within AuthProvider')
    return context
  }