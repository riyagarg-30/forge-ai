import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AuthCallback from './pages/AuthCallback'
import Workspace from './pages/Workspace'
import AnalysisPipeline from './pages/AnalysisPipeline'
import AnalysisReport from './pages/AnalysisReport'
import BuildStudio from './pages/BuildStudio'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Workspace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analysis/:sessionId"
        element={
          <ProtectedRoute>
            <AnalysisPipeline />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analysis/:sessionId/report"
        element={
          <ProtectedRoute>
            <AnalysisReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analysis/:sessionId/build-studio"
        element={
          <ProtectedRoute>
            <BuildStudio />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
