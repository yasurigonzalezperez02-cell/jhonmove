import car from '../assets/icons/car.svg'
import mail from '../assets/icons/mail.svg'
import lock from '../assets/icons/lock.svg'
import eyeOff from '../assets/icons/eye-off.svg'
import bell from '../assets/icons/bell.svg'
import search from '../assets/icons/search.svg'
import home from '../assets/icons/home.svg'
import briefcase from '../assets/icons/briefcase.svg'
import arrowLeft from '../assets/icons/arrow-left.svg'
import moreVertical from '../assets/icons/more-vertical.svg'
import mapPin from '../assets/icons/map-pin.svg'
import star from '../assets/icons/star.svg'
import creditCard from '../assets/icons/credit-card.svg'
import phone from '../assets/icons/phone.svg'
import message from '../assets/icons/message.svg'
import alert from '../assets/icons/alert.svg'
import shield from '../assets/icons/shield.svg'
import list from '../assets/icons/list.svg'
import avatarPassenger from '../assets/icons/avatar-passenger.png'
import avatarDriver from '../assets/icons/avatar-driver.png'

export const icons = {
  car,
  mail,
  lock,
  eyeOff,
  bell,
  search,
  home,
  briefcase,
  arrowLeft,
  moreVertical,
  mapPin,
  star,
  creditCard,
  phone,
  message,
  alert,
  shield,
  list,
}

export const avatars = {
  passenger: avatarPassenger,
  driver: avatarDriver,
}

export function Icon({ src, size = 18, className = '', alt = '' }) {
  return (
    <span className={`inline-flex overflow-clip shrink-0 ${className}`} style={{ width: size, height: size }}>
      <img src={src} alt={alt} width={size} height={size} className="size-full object-contain" />
    </span>
  )
}

export function MapMock({ className = '', height = 'h-56', showRoute = false, showCar = false }) {
  return (
    <div className={`relative w-full overflow-hidden bg-map ${height} ${className}`}>
      <div className="absolute inset-y-0 left-0 w-[30%] bg-water/80" />
      <div className="absolute left-5 right-5 top-[30%] h-px bg-line" />
      <div className="absolute left-[38%] top-0 bottom-0 w-px bg-line" />
      <div className="absolute left-[72%] top-0 bottom-0 w-px bg-line/80" />
      <div className="absolute left-0 right-0 top-[68%] h-px bg-line" />
      <div className="absolute left-[42%] top-8 h-16 w-24 rounded-lg bg-line" />
      <div className="absolute left-[42%] top-[38%] size-24 rounded-lg bg-line" />
      <div className="absolute right-4 top-[38%] h-24 w-16 rounded-lg bg-line" />
      {showRoute ? (
        <>
          <div className="absolute left-[36%] top-[42%] size-5 rounded-full bg-sky ring-4 ring-sky/30" />
          <div className="absolute right-10 bottom-8">
            <Icon src={icons.mapPin} size={24} />
          </div>
          <div className="absolute left-[38%] top-[48%] h-1 w-40 rounded-full bg-sky" />
        </>
      ) : null}
      {showCar ? (
        <div className="absolute left-[58%] top-[40%] rounded-xl border-2 border-white bg-amber p-1.5">
          <Icon src={icons.car} size={14} />
        </div>
      ) : null}
    </div>
  )
}

export function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString('es-CO')}`
}

export function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Hola, buenos días'
  if (h < 19) return 'Hola, buenas tardes'
  return 'Hola, buenas noches'
}
