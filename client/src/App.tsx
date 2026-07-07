import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider } from './context/AuthContext'
import { LoadingProvider } from './context/LoadingContext'
import ProtectedRoute from './components/shared/ProtectedRoute'
import Navbar from './components/shared/Navbar'
import LoadingBanner from './components/shared/LoadingBanner'
import Dashboard from './pages/Dashboard'
import Planner from './pages/Planner'
import History from './pages/History'
import Progress from './pages/Progress'
import Templates from './pages/Templates'
import Auth from './pages/Auth'

function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <Navbar />
      <LoadingBanner />
      {children}
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={<ProtectedLayout><Dashboard /></ProtectedLayout>}
            />
            <Route
              path="/planner"
              element={<ProtectedLayout><Planner /></ProtectedLayout>}
            />
            <Route
              path="/history"
              element={<ProtectedLayout><History /></ProtectedLayout>}
            />
            <Route
              path="/progress"
              element={<ProtectedLayout><Progress /></ProtectedLayout>}
            />
            <Route
              path="/templates"
              element={<ProtectedLayout><Templates /></ProtectedLayout>}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </LoadingProvider>
    </AuthProvider>
  )
}