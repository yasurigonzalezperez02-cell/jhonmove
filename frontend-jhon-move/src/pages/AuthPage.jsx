import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Icon, icons } from '../components/brand'

export default function AuthPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    contraseña: '',
    telefono: '',
    rol: 'pasajero',
    documento: '',
    licencia: '',
  })

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function goByRole(user) {
    if (user.rol === 'conductor') navigate('/conductor')
    else if (user.rol === 'administrador') navigate('/admin')
    else navigate('/pasajero')
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (tab === 'login') {
        const user = await login(form.correo, form.contraseña)
        goByRole(user)
      } else {
        const payload = { ...form }
        if (payload.rol !== 'conductor') {
          delete payload.documento
          delete payload.licencia
        }
        const user = await register(payload)
        goByRole(user)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy text-white flex justify-center">
      <div className="w-full max-w-md min-h-screen flex flex-col justify-between animate-fade-up">
        <div>
          <div className="flex flex-col items-center gap-3 pt-12 px-6">
            <div className="rounded-3xl bg-amber p-4">
              <Icon src={icons.car} size={36} />
            </div>
            <h1 className="text-[28px] font-extrabold tracking-tight">John Move</h1>
            <p className="text-sm text-mist text-center">Tu transporte urbano confiable y rápido</p>
          </div>

          <div className="flex gap-3 px-6 pt-8">
            <button
              type="button"
              onClick={() => setTab('login')}
              className={`flex-1 rounded-2xl p-3 text-sm font-semibold transition ${
                tab === 'login'
                  ? 'bg-navy-soft border border-amber text-white'
                  : 'bg-navy border border-navy-soft text-mist'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => setTab('register')}
              className={`flex-1 rounded-2xl p-3 text-sm font-semibold transition ${
                tab === 'register'
                  ? 'bg-navy-soft border border-amber text-white'
                  : 'bg-navy border border-navy-soft text-mist'
              }`}
            >
              Registrarse
            </button>
          </div>

          <form className="flex flex-col gap-4 px-6 pt-6" onSubmit={onSubmit}>
            {tab === 'register' ? (
              <>
                <Field label="NOMBRE">
                  <input
                    required
                    className="field-input"
                    value={form.nombre}
                    onChange={(e) => set('nombre', e.target.value)}
                    placeholder="Tu nombre"
                  />
                </Field>
                <Field label="TELÉFONO">
                  <input
                    className="field-input"
                    value={form.telefono}
                    onChange={(e) => set('telefono', e.target.value)}
                    placeholder="3001234567"
                  />
                </Field>
                <Field label="ROL">
                  <select
                    className="field-input"
                    value={form.rol}
                    onChange={(e) => set('rol', e.target.value)}
                  >
                    <option value="pasajero">Pasajero</option>
                    <option value="conductor">Conductor</option>
                  </select>
                </Field>
                {form.rol === 'conductor' ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="DOCUMENTO">
                      <input
                        required
                        className="field-input"
                        value={form.documento}
                        onChange={(e) => set('documento', e.target.value)}
                      />
                    </Field>
                    <Field label="LICENCIA">
                      <input
                        required
                        className="field-input"
                        value={form.licencia}
                        onChange={(e) => set('licencia', e.target.value)}
                      />
                    </Field>
                  </div>
                ) : null}
              </>
            ) : null}

            <Field label="CORREO ELECTRÓNICO">
              <div className="field-box">
                <Icon src={icons.mail} size={18} />
                <input
                  required
                  type="email"
                  className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-mist/60"
                  value={form.correo}
                  onChange={(e) => set('correo', e.target.value)}
                  placeholder="pasajero@johnmove.com"
                />
              </div>
            </Field>

            <Field label="CONTRASEÑA">
              <div className="field-box">
                <Icon src={icons.lock} size={18} />
                <input
                  required
                  type={showPass ? 'text' : 'password'}
                  minLength={6}
                  className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-mist/60"
                  value={form.contraseña}
                  onChange={(e) => set('contraseña', e.target.value)}
                  placeholder="••••••••••••"
                />
                <button type="button" onClick={() => setShowPass((v) => !v)} aria-label="Mostrar contraseña">
                  <Icon src={icons.eyeOff} size={18} />
                </button>
              </div>
            </Field>

            {tab === 'login' ? (
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="size-[18px] accent-amber"
                  />
                  Recordarme
                </label>
                <span className="font-semibold text-amber">¿Olvidaste tu contraseña?</span>
              </div>
            ) : null}

            {error ? (
              <p className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className="mt-2 w-full rounded-2xl bg-amber p-4 text-base font-bold text-navy disabled:opacity-60"
            >
              {busy ? 'Procesando…' : tab === 'login' ? 'Ingresar al Sistema' : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <p className="px-6 pb-8 pt-6 text-center text-[11px] text-mist">
          Al ingresar aceptas nuestros Términos y Políticas de Privacidad.
        </p>
      </div>

      <style>{`
        .field-input {
          width: 100%;
          border-radius: 12px;
          background: #1e293b;
          padding: 14px;
          font-size: 14px;
          color: white;
          outline: none;
          border: none;
        }
        .field-box {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          border-radius: 12px;
          background: #1e293b;
          padding: 14px;
        }
      `}</style>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="flex w-full flex-col gap-2">
      <span className="text-xs font-semibold text-mist">{label}</span>
      {children}
    </label>
  )
}
