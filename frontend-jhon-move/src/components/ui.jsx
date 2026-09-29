import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo-john-move.jpeg'

export function Shell({ children, title }) {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen">
      <header className="border-b border-line/80 bg-ink/80 backdrop-blur-md sticky top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <img
              src={logo}
              alt="John Move"
              className="size-10 rounded-full object-cover ring-1 ring-copper/50 sm:size-11"
            />
            <div className="min-w-0">
              <p className="font-display text-xl leading-none text-copper sm:text-2xl">John Move</p>
              {title ? (
                <p className="truncate text-xs text-mist/70 mt-0.5">{title}</p>
              ) : null}
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <span className="hidden text-sm text-mist/80 sm:inline truncate max-w-[10rem]">
                  {user.nombre}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-lg border border-line px-3 py-1.5 text-sm text-mist hover:border-copper/60 hover:text-white transition"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="rounded-lg px-3 py-1.5 text-sm text-mist hover:text-white transition"
                >
                  Entrar
                </NavLink>
                <NavLink
                  to="/registro"
                  className="rounded-lg bg-taxi px-3 py-1.5 text-sm font-semibold text-ink hover:brightness-105 transition"
                >
                  Registro
                </NavLink>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  )
}

export function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm text-mist/80">{label}</span>
      {children}
    </label>
  )
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-line bg-ink-soft px-3 py-2.5 text-sm text-white outline-none placeholder:text-mist/40 focus:border-copper/70 ${props.className || ''}`}
    />
  )
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-line bg-ink-soft px-3 py-2.5 text-sm text-white outline-none focus:border-copper/70 ${props.className || ''}`}
    />
  )
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const styles =
    variant === 'primary'
      ? 'bg-taxi text-ink font-semibold hover:brightness-105'
      : variant === 'copper'
        ? 'bg-copper/90 text-ink font-semibold hover:bg-copper'
        : variant === 'ghost'
          ? 'border border-line text-mist hover:border-copper/50 hover:text-white'
          : 'bg-danger/90 text-white hover:bg-danger'

  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm transition disabled:opacity-50 ${styles} ${className}`}
    >
      {children}
    </button>
  )
}

export function StatusBadge({ estado }) {
  const map = {
    solicitado: 'bg-taxi/15 text-taxi',
    aceptado: 'bg-copper/20 text-copper',
    en_curso: 'bg-ok/15 text-ok',
    finalizado: 'bg-mist/10 text-mist',
    cancelado: 'bg-danger/15 text-danger',
    activo: 'bg-ok/15 text-ok',
    inactivo: 'bg-danger/15 text-danger',
  }
  return (
    <span className={`rounded-md px-2 py-0.5 text-xs font-medium capitalize ${map[estado] || 'bg-panel text-mist'}`}>
      {String(estado).replace('_', ' ')}
    </span>
  )
}

export function Panel({ children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-line bg-panel/70 p-4 sm:p-5 ${className}`}>
      {children}
    </section>
  )
}

export function Alert({ children, tone = 'error', className = '' }) {
  const toneClass = tone === 'error' ? 'border-danger/40 text-danger' : 'border-ok/40 text-ok'
  return (
    <p className={`rounded-xl border px-3 py-2 text-sm ${toneClass} ${className}`}>{children}</p>
  )
}
