import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Icon, icons, avatars, formatMoney } from '../components/brand'

export default function DriverPage() {
  const { token, user, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [requests, setRequests] = useState([])
  const [trips, setTrips] = useState([])
  const [vehicle, setVehicle] = useState({ placa: '', marca: '', modelo: '', color: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    const [p, t] = await Promise.all([api.driverProfile(token), api.myTrips(token)])
    setProfile(p)
    setTrips(t)
    if (p.disponibilidad) {
      try {
        setRequests(await api.openRequests(token))
      } catch {
        setRequests([])
      }
    } else {
      setRequests([])
    }
  }, [token])

  useEffect(() => {
    refresh().catch((err) => setError(err.message))
    const id = setInterval(() => refresh().catch(() => {}), 5000)
    return () => clearInterval(id)
  }, [refresh])

  const todayTrips = trips.filter((t) => {
    const d = new Date(t.fecha_solicitud)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  })
  const income = todayTrips
    .filter((t) => t.estado === 'finalizado')
    .reduce((sum, t) => sum + Number(t.precio || 0), 0)

  async function toggleAvailability() {
    setBusy(true)
    setError('')
    try {
      await api.setAvailability(token, !profile.disponibilidad)
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function addVehicle(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await api.addVehicle(token, vehicle)
      setVehicle({ placa: '', marca: '', modelo: '', color: '' })
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function accept(id) {
    setBusy(true)
    try {
      await api.acceptTrip(token, id)
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function setStatus(id, estado) {
    setBusy(true)
    try {
      await api.updateTripStatus(token, id, estado)
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy text-white flex justify-center">
      <div className="w-full max-w-md min-h-screen animate-fade-up">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <img src={avatars.driver} alt="" className="size-10 rounded-full object-cover" />
            <div>
              <p className="text-sm font-bold">{user?.nombre}</p>
              <p className="flex items-center gap-1 text-xs text-mist">
                <Icon src={icons.star} size={12} /> Conductor
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={busy || !profile}
              onClick={toggleAvailability}
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold ${
                profile?.disponibilidad ? 'bg-mint' : 'bg-navy-soft text-mist'
              }`}
            >
              <span className="size-2 rounded-full bg-white" />
              {profile?.disponibilidad ? 'CONECTADO' : 'DESCONECTADO'}
            </button>
            <button type="button" onClick={logout} className="text-xs text-mist underline">
              Salir
            </button>
          </div>
        </div>

        {error ? (
          <p className="mx-5 mb-3 rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-3 px-5">
          <div className="rounded-2xl bg-navy-soft p-3.5">
            <p className="text-[11px] text-mist">INGRESOS HOY</p>
            <p className="text-xl font-extrabold">{formatMoney(income)}</p>
          </div>
          <div className="rounded-2xl bg-navy-soft p-3.5">
            <p className="text-[11px] text-mist">VIAJES HOY</p>
            <p className="text-xl font-extrabold">{todayTrips.length} viajes</p>
          </div>
        </div>

        <div className="space-y-3 p-5">
          <p className="text-sm font-bold">Solicitudes de Viaje Recientes</p>
          {requests.length === 0 ? (
            <p className="text-sm text-mist">
              {profile?.disponibilidad
                ? 'No hay solicitudes abiertas'
                : 'Conéctate para recibir solicitudes'}
            </p>
          ) : (
            requests.map((r) => (
              <div key={r.id_viaje} className="rounded-[20px] bg-white p-4 text-navy space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-amber p-1.5">
                      <Icon src={icons.mapPin} size={14} />
                    </span>
                    <p className="text-sm font-bold">Solicitud Disponible</p>
                  </div>
                  <p className="text-xs font-bold text-sky">{r.pasajero_nombre}</p>
                </div>
                <div className="h-px bg-line" />
                <div className="space-y-2 text-[13px] text-slate">
                  <p className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-mint" /> Inicio: {r.origen}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-danger" /> Destino: {r.destino}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-extrabold">{formatMoney(r.precio)}</p>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => accept(r.id_viaje)}
                    className="rounded-xl bg-mint px-4 py-2.5 text-[13px] font-bold text-white"
                  >
                    Aceptar Viaje
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-5 pb-4 space-y-3">
          <p className="text-sm font-bold">Mis viajes</p>
          {trips.slice(0, 5).map((t) => (
            <div key={t.id_viaje} className="rounded-2xl border border-navy-soft bg-navy-soft/60 p-3 space-y-2">
              <div className="flex justify-between gap-2 text-sm">
                <p>
                  {t.origen} → {t.destino}
                </p>
                <span className="text-xs text-mist capitalize">{t.estado}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {t.estado === 'aceptado' ? (
                  <button
                    type="button"
                    className="rounded-lg bg-sky px-3 py-1.5 text-xs font-bold"
                    disabled={busy}
                    onClick={() => setStatus(t.id_viaje, 'en_curso')}
                  >
                    Iniciar
                  </button>
                ) : null}
                {['aceptado', 'en_curso'].includes(t.estado) ? (
                  <button
                    type="button"
                    className="rounded-lg bg-mint px-3 py-1.5 text-xs font-bold"
                    disabled={busy}
                    onClick={() => setStatus(t.id_viaje, 'finalizado')}
                  >
                    Finalizar
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 pb-8">
          <p className="mb-3 text-sm font-bold">Registrar vehículo</p>
          {(profile?.vehiculos || []).map((v) => (
            <p key={v.id_vehiculo} className="mb-2 rounded-xl bg-navy-soft px-3 py-2 text-sm text-mist">
              {v.placa} · {v.marca} {v.modelo}
            </p>
          ))}
          <form className="grid grid-cols-2 gap-2" onSubmit={addVehicle}>
            {['placa', 'marca', 'modelo', 'color'].map((key) => (
              <input
                key={key}
                required={key === 'placa'}
                placeholder={key[0].toUpperCase() + key.slice(1)}
                className="rounded-xl bg-navy-soft px-3 py-2.5 text-sm outline-none"
                value={vehicle[key]}
                onChange={(e) => setVehicle((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            ))}
            <button
              type="submit"
              disabled={busy}
              className="col-span-2 rounded-xl bg-amber py-3 text-sm font-bold text-navy"
            >
              Guardar vehículo
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
