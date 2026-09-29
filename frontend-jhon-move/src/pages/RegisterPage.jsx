import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Shell, Field, Input, Select, Button, Panel, Alert } from '../components/ui'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    contraseña: '',
    telefono: '',
    rol: 'pasajero',
    documento: '',
    licencia: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const payload = { ...form }
      if (payload.rol !== 'conductor') {
        delete payload.documento
        delete payload.licencia
      }
      const user = await register(payload)
      navigate(user.rol === 'conductor' ? '/conductor' : '/pasajero')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Shell title="Registro">
      <div className="mx-auto max-w-lg animate-fade-up">
        <Panel>
          <h1 className="font-display text-3xl text-copper mb-1">Crear cuenta</h1>
          <p className="text-sm text-mist/70 mb-5">Pasajero o conductor en un solo registro</p>
          <form className="space-y-4" onSubmit={onSubmit}>
            <Field label="Nombre">
              <Input required value={form.nombre} onChange={(e) => set('nombre', e.target.value)} />
            </Field>
            <Field label="Correo">
              <Input
                type="email"
                required
                value={form.correo}
                onChange={(e) => set('correo', e.target.value)}
              />
            </Field>
            <Field label="Contraseña">
              <Input
                type="password"
                required
                minLength={6}
                value={form.contraseña}
                onChange={(e) => set('contraseña', e.target.value)}
              />
            </Field>
            <Field label="Teléfono">
              <Input value={form.telefono} onChange={(e) => set('telefono', e.target.value)} />
            </Field>
            <Field label="Rol">
              <Select value={form.rol} onChange={(e) => set('rol', e.target.value)}>
                <option value="pasajero">Pasajero</option>
                <option value="conductor">Conductor</option>
              </Select>
            </Field>
            {form.rol === 'conductor' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Documento">
                  <Input
                    required
                    value={form.documento}
                    onChange={(e) => set('documento', e.target.value)}
                  />
                </Field>
                <Field label="Licencia">
                  <Input
                    required
                    value={form.licencia}
                    onChange={(e) => set('licencia', e.target.value)}
                  />
                </Field>
              </div>
            ) : null}
            {error ? <Alert>{error}</Alert> : null}
            <Button className="w-full" disabled={busy} type="submit">
              {busy ? 'Creando…' : 'Registrarme'}
            </Button>
          </form>
          <p className="mt-4 text-sm text-mist/70">
            ¿Ya tienes cuenta?{' '}
            <Link className="text-taxi hover:underline" to="/login">
              Inicia sesión
            </Link>
          </p>
        </Panel>
      </div>
    </Shell>
  )
}
