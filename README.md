# John Move

PWA de transporte para conectar pasajeros y conductores.

## Stack

- **Frontend:** React + Vite PWA + Tailwind CSS (`frontend-jhon-move`)
- **Backend:** Express + JWT (`backend-jhon-move`)
- **DB:** MySQL en Clever Cloud

## Arranque rápido

### Backend

```bash
cd backend-jhon-move
cp .env.example .env   # completa credenciales MySQL
npm install
npm run migrate
npm run dev
```

### Frontend

```bash
cd frontend-jhon-move
npm install
npm run dev
```

Abre `http://localhost:5173`. Vite hace proxy de `/api` al puerto 4000.

### Admin inicial

```bash
curl -X POST http://localhost:4000/api/admin/seed \
  -H "Content-Type: application/json" \
  -d "{\"nombre\":\"Admin\",\"correo\":\"admin@johnmove.com\",\"contraseña\":\"Admin123!\",\"secret\":\"TU_JWT_SECRET\"}"
```

## Roles

- Pasajero: solicitar, cancelar, historial, calificar
- Conductor: vehículo, disponibilidad, aceptar/finalizar viajes
- Administrador: usuarios, conductores, viajes
