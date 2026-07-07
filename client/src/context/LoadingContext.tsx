import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react'
import type { ReactNode } from 'react'
import { subscribeToApiActivity } from '../services/api'

interface LoadingContextType {
  isLoading: boolean
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    return subscribeToApiActivity((pending) => setIsLoading(pending > 0))
  }, [])

  return (
    <LoadingContext.Provider value={{ isLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading(): LoadingContextType {
  const context = useContext(LoadingContext)
  if (!context) throw new Error('useLoading must be used within LoadingProvider')
  return context
}
