# Backend John Move

API REST con Express + MySQL (Clever Cloud).

## Setup

1. Copia `.env.example` a `.env` y completa las variables de Clever Cloud.
2. Instala dependencias: `npm install`
3. Crea tablas: `npm run migrate`
4. Desarrollo: `npm run dev`
5. Producción: `npm start`

API en `http://localhost:4000`

## Endpoints principales

- `GET /api/health`
- `POST /api/auth/register` — pasajero o conductor
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PATCH /api/drivers/availability`
- `POST /api/drivers/vehicles`
- `POST /api/trips` — solicitar viaje (pasajero)
- `GET /api/trips/requests` — solicitudes abiertas (conductor)
- `POST /api/trips/:id/accept`
- `PATCH /api/trips/:id/status`
- `POST /api/trips/:id/rate`
- `GET /api/admin/users` | `/drivers`
- `POST /api/admin/seed` — crear primer administrador (`secret` = `JWT_SECRET`)
