import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import {
  Icon,
  icons,
  avatars,
  MapMock,
  formatMoney,
  greeting,
} from '../components/brand'

const VEHICLES = [
  { id: 'eco', name: 'EcoTaxi Común', eta: 'Llegada: 4 min • Capacidad: 4', multiplier: 1, icon: icons.car },
  { id: 'vip', name: 'Taxi Premium (VIP)', eta: 'Llegada: 7 min • Sedán de Lujo', multiplier: 1.45, icon: icons.star },
]

export default function PassengerPage() {
  const { token, user, logout } = useAuth()
  const [step, setStep] = useState('home')
  const [origen, setOrigen] = useState('Mi ubicación actual')
  const [destino, setDestino] = useState('')
  const [vehicle, setVehicle] = useState('eco')
  const [trips, setTrips] = useState([])
  const [active, setActive] = useState(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const data = await api.myTrips(token)
    setTrips(data)
    const current = data.find((t) => ['solicitado', 'aceptado', 'en_curso'].includes(t.estado))
    if (current) {
      const detail = await api.getTrip(token, current.id_viaje)
      setActive(detail)
      if (detail.estado === 'solicitado' || detail.estado === 'aceptado') setStep('assigned')
      if (detail.estado === 'en_curso') setStep('active')
    }
  }, [token])

  useEffect(() => {
    load().catch((err) => setError(err.message))
  }, [load])

  const selected = VEHICLES.find((v) => v.id === vehicle)
  const estimate = Math.round(12500 * (selected?.multiplier || 1))

  async function confirmTrip() {
    if (!destino.trim()) {
      setError('Ingresa un destino')
      return
    }
    setBusy(true)
    setError('')
    try {
      const trip = await api.requestTrip(token, { origen, destino })
      setActive(trip)
      setStep('assigned')
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function cancelActive() {
    if (!active) return
    setBusy(true)
    try {
      await api.updateTripStatus(token, active.id_viaje, 'cancelado')
      setActive(null)
      setStep('home')
      setDestino('')
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function refreshActive() {
    if (!active) return
    const detail = await api.getTrip(token, active.id_viaje)
    setActive(detail)
    if (detail.estado === 'en_curso') setStep('active')
    if (detail.estado === 'finalizado') setStep('history')
    if (detail.estado === 'cancelado') {
      setActive(null)
      setStep('home')
    }
  }

  async function sendRating() {
    const finished = trips.find((t) => t.estado === 'finalizado')
    if (!finished) return
    setBusy(true)
    try {
      await api.rateTrip(token, finished.id_viaje, { puntuacion: rating, comentario: comment })
      setComment('')
      setStep('history')
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (!active || !['solicitado', 'aceptado', 'en_curso'].includes(active.estado)) return
    const id = setInterval(() => {
      refreshActive().catch(() => {})
    }, 4000)
    return () => clearInterval(id)
  }, [active?.id_viaje, active?.estado])

  return (
    <div className="min-h-screen bg-canvas flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-canvas relative shadow-xl shadow-navy/5">
        {error ? (
          <div className="absolute top-3 left-4 right-4 z-20 rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
            {error}
          </div>
        ) : null}

        {step === 'home' ? (
          <Home
            user={user}
            destino={destino}
            setDestino={setDestino}
            onSearch={() => {
              if (!destino.trim()) {
                setError('Ingresa tu destino')
                return
              }
              setError('')
              setStep('confirm')
            }}
            onQuick={(place) => {
              setDestino(place)
              setStep('confirm')
            }}
            onHistory={() => setStep('history')}
            onLogout={logout}
          />
        ) : null}

        {step === 'confirm' ? (
          <Confirm
            origen={origen}
            setOrigen={setOrigen}
            destino={destino}
            setDestino={setDestino}
            vehicle={vehicle}
            setVehicle={setVehicle}
            estimate={estimate}
            busy={busy}
            onBack={() => setStep('home')}
            onConfirm={confirmTrip}
          />
        ) : null}

        {step === 'assigned' && active ? (
          <Assigned trip={active} busy={busy} onCancel={cancelActive} onBack={() => setStep('home')} />
        ) : null}

        {step === 'active' && active ? (
          <Active trip={active} busy={busy} onCancel={cancelActive} onBack={() => setStep('home')} />
        ) : null}

        {step === 'history' ? (
          <History
            trips={trips}
            rating={rating}
            setRating={setRating}
            comment={comment}
            setComment={setComment}
            busy={busy}
            onRate={sendRating}
            onBack={() => setStep('home')}
          />
        ) : null}
      </div>
    </div>
  )
}

function Home({ user, destino, setDestino, onSearch, onQuick, onHistory, onLogout }) {
  return (
    <div className="flex min-h-screen flex-col justify-between animate-fade-up">
      <div>
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <img src={avatars.passenger} alt="" className="size-10 rounded-full object-cover" />
            <div>
              <p className="text-xs text-slate">{greeting()}</p>
              <p className="text-base font-bold text-navy">{user?.nombre}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onHistory} className="rounded-xl border border-line bg-white p-2.5">
              <Icon src={icons.bell} size={18} />
            </button>
            <button type="button" onClick={onLogout} className="rounded-xl border border-line bg-white px-3 text-xs font-semibold text-slate">
              Salir
            </button>
          </div>
        </div>
        <MapMock height="h-[52vh] sm:h-[480px]" />
      </div>

      <div className="rounded-t-3xl bg-white p-5 shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-line" />
        <h2 className="mb-4 text-lg font-bold text-navy">¿A dónde vamos hoy?</h2>
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-line bg-canvas p-3.5">
          <span className="size-2 rounded-full bg-sky" />
          <input
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate"
            placeholder="Ingresa tu destino..."
            value={destino}
            onChange={(e) => setDestino(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          />
          <button type="button" onClick={onSearch}>
            <Icon src={icons.search} size={18} />
          </button>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onQuick('Casa')}
            className="flex items-center gap-1.5 rounded-full bg-canvas px-3 py-2 text-xs font-semibold"
          >
            <Icon src={icons.home} size={14} /> Casa
          </button>
          <button
            type="button"
            onClick={() => onQuick('Trabajo')}
            className="flex items-center gap-1.5 rounded-full bg-canvas px-3 py-2 text-xs font-semibold"
          >
            <Icon src={icons.briefcase} size={14} /> Trabajo
          </button>
        </div>
      </div>
    </div>
  )
}

function Header({ title, subtitle, onBack }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <div className="flex flex-1 items-center gap-3">
        <button type="button" onClick={onBack} className="rounded-xl border border-line bg-white p-2">
          <Icon src={icons.arrowLeft} size={18} />
        </button>
        <div>
          <p className="text-lg font-bold text-navy">{title}</p>
          {subtitle ? <p className="text-xs text-slate">{subtitle}</p> : null}
        </div>
      </div>
      <div className="rounded-xl border border-line bg-white p-2">
        <Icon src={icons.moreVertical} size={18} />
      </div>
    </div>
  )
}

function Confirm({ origen, setOrigen, destino, setDestino, vehicle, setVehicle, estimate, busy, onBack, onConfirm }) {
  return (
    <div className="flex min-h-screen flex-col justify-between animate-fade-up">
      <div>
        <Header title="Confirmar Ruta" subtitle="John Move" onBack={onBack} />
        <div className="px-5 py-3">
          <div className="rounded-2xl border border-line bg-white p-3.5 space-y-3">
            <label className="flex gap-3 items-start">
              <span className="mt-2 size-2 rounded-full bg-sky" />
              <span className="flex-1">
                <span className="block text-[11px] text-mist">ORIGEN</span>
                <input
                  className="w-full bg-transparent text-sm font-semibold outline-none"
                  value={origen}
                  onChange={(e) => setOrigen(e.target.value)}
                />
              </span>
            </label>
            <div className="h-px bg-line" />
            <label className="flex gap-3 items-start">
              <span className="mt-2 size-2 rounded-full bg-danger" />
              <span className="flex-1">
                <span className="block text-[11px] text-mist">DESTINO</span>
                <input
                  className="w-full bg-transparent text-sm font-semibold outline-none"
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                />
              </span>
            </label>
          </div>
        </div>
        <MapMock height="h-44" showRoute />
        <div className="space-y-3 p-5">
          <p className="text-sm font-bold">Vehículos Disponibles</p>
          {VEHICLES.map((v) => {
            const selected = vehicle === v.id
            const price = Math.round(12500 * v.multiplier)
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setVehicle(v.id)}
                className={`flex w-full items-center justify-between rounded-2xl p-3 text-left ${
                  selected ? 'bg-amber' : 'border border-line bg-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`rounded-xl p-2 ${selected ? 'bg-white' : 'bg-canvas'}`}>
                    <Icon src={v.icon} size={24} />
                  </span>
                  <span>
                    <span className="block text-sm font-bold">{v.name}</span>
                    <span className="block text-[11px] text-slate">{v.eta}</span>
                  </span>
                </span>
                <span className="text-base font-extrabold">{formatMoney(price)}</span>
              </button>
            )
          })}
        </div>
      </div>
      <div className="space-y-3.5 bg-white p-5">
        <div className="flex items-center justify-between text-[13px]">
          <span className="flex items-center gap-2">
            <Icon src={icons.creditCard} size={16} /> Efectivo / tarjeta
          </span>
          <span className="font-semibold text-sky">Est. {formatMoney(estimate)}</span>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={onConfirm}
          className="w-full rounded-2xl bg-navy p-4 text-base font-bold text-white disabled:opacity-60"
        >
          {busy ? 'Solicitando…' : 'Confirmar y Solicitar Viaje'}
        </button>
      </div>
    </div>
  )
}

function Assigned({ trip, busy, onCancel, onBack }) {
  const assigned = Boolean(trip.conductor_nombre)
  return (
    <div className="flex min-h-screen flex-col justify-between animate-fade-up">
      <div>
        <Header
          title={assigned ? 'Conductor asignado' : 'Buscando Conductor'}
          subtitle="Tarifa fija garantizada"
          onBack={onBack}
        />
        <MapMock height="h-72" showRoute />
        <div className="space-y-5 p-5">
          <div className="flex items-center gap-3 rounded-2xl bg-sky-soft p-4">
            <span className="size-3 rounded-full bg-sky animate-pulse" />
            <p className="text-sm font-semibold">
              {assigned ? 'Conductor en camino a tu ubicación' : 'Asignando la unidad más cercana...'}
            </p>
          </div>
          {assigned ? (
            <div className="rounded-[20px] border border-line bg-white p-4 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={avatars.driver} alt="" className="size-12 rounded-full object-cover" />
                  <div>
                    <p className="font-bold">{trip.conductor_nombre}</p>
                    <p className="flex items-center gap-1 text-xs text-slate">
                      <Icon src={icons.star} size={12} /> Conductor John Move
                    </p>
                  </div>
                </div>
                {trip.conductor_telefono ? (
                  <a href={`tel:${trip.conductor_telefono}`} className="rounded-full bg-canvas p-2.5">
                    <Icon src={icons.phone} size={18} />
                  </a>
                ) : null}
              </div>
              <div className="h-px bg-line" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-mist">VEHÍCULO</p>
                  <p className="text-sm font-bold">
                    {trip.marca} {trip.modelo}
                  </p>
                  <p className="text-xs text-slate">Color {trip.color || '—'}</p>
                </div>
                <div className="rounded-lg bg-amber px-3 py-1.5 text-sm font-extrabold">
                  PLACA: {trip.placa || '—'}
                </div>
              </div>
            </div>
          ) : null}
          <p className="text-sm text-slate">
            {trip.origen} → {trip.destino} · {formatMoney(trip.precio)}
          </p>
        </div>
      </div>
      <div className="bg-white p-5">
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className="w-full rounded-xl bg-danger-soft p-3.5 text-sm font-semibold text-danger"
        >
          Cancelar Solicitud de Viaje
        </button>
      </div>
    </div>
  )
}

function Active({ trip, busy, onCancel, onBack }) {
  return (
    <div className="flex min-h-screen flex-col justify-between animate-fade-up">
      <div>
        <Header title="Viaje Activo" subtitle="En ruta al destino" onBack={onBack} />
        <MapMock height="h-64" showRoute showCar />
        <div className="space-y-4 p-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-ok-soft px-3 py-2">
            <span className="size-2 rounded-full bg-mint" />
            <span className="text-xs font-bold text-mint">En curso hacia {trip.destino}</span>
          </div>
          <div className="flex gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-2xl border border-line bg-white p-3 text-sm font-semibold">
              <Icon src={icons.message} size={16} /> Mensaje
            </div>
            <div className="flex flex-1 items-center gap-2 rounded-2xl bg-danger-soft p-3 text-sm font-bold text-danger">
              <Icon src={icons.alert} size={16} /> SOS
            </div>
          </div>
          <div className="rounded-[20px] border border-line bg-white p-4 space-y-3">
            <p className="text-sm font-bold">Detalles de Seguridad</p>
            <p className="text-xs text-slate">
              Este viaje está respaldado por John Move. Conductor: {trip.conductor_nombre || '—'}.
            </p>
            <p className="flex items-center gap-2 text-xs font-semibold text-mint">
              <Icon src={icons.shield} size={16} /> Verificación de identidad aprobada
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white p-5">
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className="w-full rounded-xl bg-danger-soft p-3.5 text-sm font-semibold text-danger"
        >
          Cancelar Viaje
        </button>
      </div>
    </div>
  )
}

function History({ trips, rating, setRating, comment, setComment, busy, onRate, onBack }) {
  const rateTarget = trips.find((t) => t.estado === 'finalizado')
  return (
    <div className="flex min-h-screen flex-col justify-between animate-fade-up">
      <div>
        <Header title="Historial de Viajes" subtitle="Consulta tus últimos trayectos" onBack={onBack} />
        <div className="space-y-3 p-5">
          {trips.length === 0 ? (
            <p className="text-sm text-slate">Aún no hay viajes</p>
          ) : (
            trips.map((t) => (
              <div key={t.id_viaje} className="rounded-2xl border border-line bg-white p-3.5 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-mist">
                    {new Date(t.fecha_solicitud).toLocaleString('es-CO')}
                  </span>
                  <span
                    className={`font-extrabold ${
                      t.estado === 'finalizado'
                        ? 'text-mint'
                        : t.estado === 'cancelado'
                          ? 'text-danger'
                          : 'text-sky'
                    }`}
                  >
                    {t.estado}
                  </span>
                </div>
                <p className="text-[15px] font-bold">{t.destino}</p>
                <p className="text-[13px] text-slate">
                  {t.conductor_nombre ? `Conductor: ${t.conductor_nombre}` : `Desde ${t.origen}`}
                </p>
                <p className="pt-1 text-[15px] font-extrabold">{formatMoney(t.precio)}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {rateTarget ? (
        <div className="rounded-t-3xl bg-white p-5 shadow-[0_-6px_16px_rgba(15,23,42,0.08)] space-y-3">
          <div className="mx-auto h-1 w-9 rounded-full bg-line" />
          <p className="text-center text-base font-bold">
            ¿Cómo estuvo tu viaje{rateTarget.conductor_nombre ? ` con ${rateTarget.conductor_nombre}` : ''}?
          </p>
          <p className="text-center text-xs text-slate">
            Tu opinión ayuda a mantener la seguridad en nuestra plataforma.
          </p>
          <div className="flex justify-center gap-2.5 py-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)} className={n <= rating ? 'opacity-100' : 'opacity-30'}>
                <Icon src={icons.star} size={32} />
              </button>
            ))}
          </div>
          <textarea
            className="w-full rounded-xl border border-line bg-canvas p-3 text-sm outline-none"
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escribe un comentario..."
          />
          <button
            type="button"
            disabled={busy}
            onClick={onRate}
            className="w-full rounded-xl bg-amber p-3.5 text-sm font-bold text-navy"
          >
            Enviar Calificación
          </button>
        </div>
      ) : (
        <div className="p-5">
          <Link to="/" className="block text-center text-sm text-sky font-semibold">
            Volver al inicio
          </Link>
        </div>
      )}
    </div>
  )
}
