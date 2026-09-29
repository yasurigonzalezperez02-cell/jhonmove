import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Shell, Field, Input, Button, Panel, Alert } from '../components/ui'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [correo, setCorreo] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const user = await login(correo, contraseña)
      if (user.rol === 'conductor') navigate('/conductor')
      else if (user.rol === 'administrador') navigate('/admin')
      else navigate('/pasajero')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Shell title="Inicio de sesión">
      <div className="mx-auto max-w-md animate-fade-up">
        <Panel>
          <h1 className="font-display text-3xl text-copper mb-1">Entrar</h1>
          <p className="text-sm text-mist/70 mb-5">Accede a tu cuenta John Move</p>
          <form className="space-y-4" onSubmit={onSubmit}>
            <Field label="Correo">
              <Input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="tu@correo.com"
              />
            </Field>
            <Field label="Contraseña">
              <Input
                type="password"
                required
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                placeholder="••••••••"
              />
            </Field>
            {error ? <Alert>{error}</Alert> : null}
            <Button className="w-full" disabled={busy} type="submit">
              {busy ? 'Entrando…' : 'Iniciar sesión'}
            </Button>
          </form>
          <p className="mt-4 text-sm text-mist/70">
            ¿Sin cuenta?{' '}
            <Link className="text-taxi hover:underline" to="/registro">
              Regístrate
            </Link>
          </p>
        </Panel>
      </div>
    </Shell>
  )
}
