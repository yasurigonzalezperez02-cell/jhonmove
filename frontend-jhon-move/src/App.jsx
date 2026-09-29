import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import PWABadge from './PWABadge.jsx'
import AuthPage from './pages/AuthPage'
import PassengerPage from './pages/PassengerPage'
import DriverPage from './pages/DriverPage'
import AdminPage from './pages/AdminPage'

function Protected({ roles, children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return <div className="min-h-screen grid place-items-center bg-canvas text-slate">Cargando…</div>
  }
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.rol)) {
    const fallback =
      user.rol === 'conductor' ? '/conductor' : user.rol === 'administrador' ? '/admin' : '/pasajero'
    return <Navigate to={fallback} replace />
  }
  return children
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return <div className="min-h-screen grid place-items-center bg-canvas text-slate">Cargando…</div>
  }
  if (user) {
    const fallback =
      user.rol === 'conductor' ? '/conductor' : user.rol === 'administrador' ? '/admin' : '/pasajero'
    return <Navigate to={fallback} replace />
  }
  return children
}

export default function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <PublicOnly>
              <AuthPage />
            </PublicOnly>
          }
        />
        <Route
          path="/login"
          element={
            <PublicOnly>
              <AuthPage />
            </PublicOnly>
          }
        />
        <Route
          path="/registro"
          element={
            <PublicOnly>
              <AuthPage />
            </PublicOnly>
          }
        />
        <Route
          path="/pasajero"
          element={
            <Protected roles={['pasajero']}>
              <PassengerPage />
            </Protected>
          }
        />
        <Route
          path="/conductor"
          element={
            <Protected roles={['conductor']}>
              <DriverPage />
            </Protected>
          }
        />
        <Route
          path="/admin"
          element={
            <Protected roles={['administrador']}>
              <AdminPage />
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <PWABadge />
    </>
  )
}
