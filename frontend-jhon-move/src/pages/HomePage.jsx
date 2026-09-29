import { Link } from 'react-router-dom'
import { Shell, Button } from '../components/ui'
import logo from '../assets/logo-john-move.jpeg'
import { useAuth } from '../context/AuthContext'

export default function HomePage() {
  const { user } = useAuth()
  const dash =
    user?.rol === 'conductor'
      ? '/conductor'
      : user?.rol === 'administrador'
        ? '/admin'
        : user
          ? '/pasajero'
          : null

  return (
    <Shell>
      <section className="relative overflow-hidden rounded-[1.75rem] border border-line min-h-[70vh] sm:min-h-[75vh] flex items-end">
        <img
          src={logo}
          alt=""
          className="absolute inset-0 size-full object-cover object-center scale-105 animate-pulse-soft"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/35" />

        <div className="relative z-10 w-full p-6 sm:p-10 md:p-14 space-y-5 animate-fade-up">
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-copper tracking-tight">
            John Move
          </h1>
          <p className="max-w-md text-base sm:text-lg text-mist/90 animate-fade-up-delay">
            Tu mejor ruta empieza aquí. Conectamos pasajeros y conductores en una PWA rápida y
            clara.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            {dash ? (
              <Link to={dash}>
                <Button>Ir a mi panel</Button>
              </Link>
            ) : (
              <>
                <Link to="/registro">
                  <Button>Crear cuenta</Button>
                </Link>
                <Link to="/login">
                  <Button variant="ghost">Ya tengo cuenta</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </Shell>
  )
}
