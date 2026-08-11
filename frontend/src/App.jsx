import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Admin from './pages/Admin'
import { authAPI } from './api/admin.js'

function App() {
  const [auth, setAuth] = useState(() => {
    const storedUser = authAPI.getStoredUser()
    const accessToken = localStorage.getItem('access_token')
    return storedUser && accessToken ? { user: storedUser, access_token: accessToken } : null
  })

  const handleLogin = (authData) => {
    setAuth(authData)
  }

  const handleLogout = () => {
    authAPI.logout()
    setAuth(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            auth ? <Navigate to="/admin" replace /> : <Login onLogin={handleLogin} />
          }
        />

        {/* Admin Routes - Protected */}
        <Route
          path="/admin"
          element={
            auth ? (
              <Admin
                user={auth.user}
                accessToken={auth.access_token}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Catch all - Redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
