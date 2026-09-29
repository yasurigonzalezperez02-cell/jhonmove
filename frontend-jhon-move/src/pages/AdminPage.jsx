import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Icon, icons, avatars } from '../components/brand'

export default function AdminPage() {
  const { token, user, logout } = useAuth()
  const [users, setUsers] = useState([])
  const [drivers, setDrivers] = useState([])
  const [trips, setTrips] = useState([])
  const [error, setError] = useState('')
  const [tab, setTab] = useState('users')

  async function load() {
    const [u, d, t] = await Promise.all([
      api.adminUsers(token),
      api.adminDrivers(token),
      api.myTrips(token),
    ])
    setUsers(u)
    setDrivers(d)
    setTrips(t)
  }

  useEffect(() => {
    load().catch((err) => setError(err.message))
  }, [token])

  async function toggleStatus(id, estado) {
    try {
      await api.setUserStatus(token, id, estado === 'activo' ? 'inactivo' : 'activo')
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  const activeDrivers = drivers.filter((d) => d.estado === 'activo').length
  const tripsLive = trips.filter((t) => ['solicitado', 'aceptado', 'en_curso'].includes(t.estado)).length

  return (
    <div className="min-h-screen bg-canvas animate-fade-up">
      <header className="bg-navy text-white px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber p-2">
            <Icon src={icons.car} size={24} />
          </div>
          <div>
            <p className="text-xl font-extrabold">John Move Admin</p>
            <p className="text-xs text-mist">Panel de control centralizado</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="hidden sm:block text-sm">Soporte: Central de Monitoreo</p>
          <div className="flex items-center gap-2">
            <img src={avatars.driver} alt="" className="size-9 rounded-full object-cover" />
            <span className="text-sm font-semibold">{user?.nombre || 'Admin'}</span>
          </div>
          <button type="button" onClick={logout} className="text-xs text-mist underline">
            Salir
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-4 sm:p-8 space-y-6">
        {error ? (
          <p className="rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="TOTAL USUARIOS REGISTRADOS" value={users.length} hint="Cuentas en MySQL" />
          <Stat label="CONDUCTORES ACTIVOS" value={activeDrivers} hint={`${drivers.length} registrados`} tone="mint" />
          <Stat label="VIAJES EN CURSO" value={tripsLive} hint="Monitoreados vía API" tone="sky" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_420px]">
          <section className="rounded-[20px] border border-line bg-white p-4 sm:p-6 space-y-4 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Gestión de Cuentas</h2>
              <div className="flex gap-2">
                {[
                  ['users', 'Usuarios'],
                  ['drivers', 'Conductores'],
                  ['trips', 'Viajes'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                      tab === key ? 'bg-amber text-navy' : 'bg-canvas text-slate'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              {tab === 'users' ? (
                <table className="w-full min-w-[40rem] text-left text-sm">
                  <thead className="bg-canvas text-xs text-slate">
                    <tr>
                      <th className="p-3">Nombre</th>
                      <th className="p-3">Rol</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id_usuario} className="border-t border-line">
                        <td className="p-3 font-semibold">{u.nombre}</td>
                        <td className="p-3 capitalize text-slate">{u.rol}</td>
                        <td className="p-3">
                          <Badge ok={u.estado === 'activo'}>{u.estado}</Badge>
                        </td>
                        <td className="p-3">
                          {u.rol !== 'administrador' ? (
                            <button
                              type="button"
                              onClick={() => toggleStatus(u.id_usuario, u.estado)}
                              className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                                u.estado === 'activo'
                                  ? 'bg-danger-soft text-danger'
                                  : 'bg-ok-soft text-mint'
                              }`}
                            >
                              {u.estado === 'activo' ? 'Desactivar Cuenta' : 'Activar Cuenta'}
                            </button>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}

              {tab === 'drivers' ? (
                <table className="w-full min-w-[40rem] text-left text-sm">
                  <thead className="bg-canvas text-xs text-slate">
                    <tr>
                      <th className="p-3">Nombre</th>
                      <th className="p-3">Documento</th>
                      <th className="p-3">Disponible</th>
                      <th className="p-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map((d) => (
                      <tr key={d.id_conductor} className="border-t border-line">
                        <td className="p-3 font-semibold">{d.nombre}</td>
                        <td className="p-3 text-slate">{d.documento}</td>
                        <td className="p-3">{d.disponibilidad ? 'Sí' : 'No'}</td>
                        <td className="p-3">
                          <Badge ok={d.estado === 'activo'}>{d.estado}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}

              {tab === 'trips' ? (
                <table className="w-full min-w-[44rem] text-left text-sm">
                  <thead className="bg-canvas text-xs text-slate">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Ruta</th>
                      <th className="p-3">Pasajero</th>
                      <th className="p-3">Conductor</th>
                      <th className="p-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trips.map((t) => (
                      <tr key={t.id_viaje} className="border-t border-line">
                        <td className="p-3">{t.id_viaje}</td>
                        <td className="p-3">
                          {t.origen} → {t.destino}
                        </td>
                        <td className="p-3">{t.pasajero_nombre}</td>
                        <td className="p-3">{t.conductor_nombre || '—'}</td>
                        <td className="p-3 capitalize">{t.estado}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
            </div>
          </section>

          <aside className="rounded-[20px] bg-navy text-white p-6 space-y-5">
            <div className="flex items-center gap-2.5">
              <Icon src={icons.list} size={20} />
              <p className="text-base font-extrabold">Requisitos del Producto</p>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold text-amber">REQUISITOS FUNCIONALES</p>
              <ul className="space-y-1.5 text-xs text-white/90">
                {[
                  'Registro e inicio de sesión',
                  'Solicitud y aceptación de viajes',
                  'Estados del viaje e historial',
                  'Calificación del servicio',
                  'Administración de cuentas',
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 rounded-full bg-amber" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="h-px bg-white/10" />
            <div>
              <p className="mb-2 text-xs font-bold text-sky">REQUISITOS NO FUNCIONALES</p>
              <ul className="space-y-1.5 text-xs text-white/90">
                {[
                  'PWA adaptable a móvil, tablet y escritorio',
                  'API REST + MySQL',
                  'Contraseñas con hash seguro',
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 rounded-full bg-sky" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, hint, tone = 'mint' }) {
  const toneClass = tone === 'sky' ? 'text-sky' : 'text-mint'
  return (
    <div className="rounded-2xl border border-line bg-white p-5 sm:p-6 space-y-2">
      <p className="text-xs font-semibold text-mist">{label}</p>
      <p className="text-3xl font-extrabold text-navy">{value}</p>
      <p className={`text-xs font-semibold ${toneClass}`}>{hint}</p>
    </div>
  )
}

function Badge({ children, ok }) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-1 text-xs font-bold capitalize ${
        ok ? 'bg-ok-soft text-mint' : 'bg-danger-soft text-danger'
      }`}
    >
      {children}
    </span>
  )
}
