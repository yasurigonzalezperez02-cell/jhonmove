import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)
const STORAGE_KEY = 'john_move_auth'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}').token || null
    } catch {
      return null
    }
  })
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}').user || null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(Boolean(token))

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    let cancelled = false
    api
      .me(token)
      .then((profile) => {
        if (!cancelled) {
          setUser(profile)
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user: profile }))
        }
      })
      .catch(() => {
        if (!cancelled) {
          setToken(null)
          setUser(null)
          localStorage.removeItem(STORAGE_KEY)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  function persist(nextToken, nextUser) {
    setToken(nextToken)
    setUser(nextUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }))
  }

  async function login(correo, contraseña) {
    const data = await api.login({
      correo: String(correo || '').trim().toLowerCase(),
      contraseña,
    })
    persist(data.token, data.user)
    return data.user
  }

  async function register(payload) {
    const data = await api.register({
      ...payload,
      correo: String(payload.correo || '').trim().toLowerCase(),
    })
    persist(data.token, data.user)
    return data.user
  }

  function logout() {
    setToken(null)
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
