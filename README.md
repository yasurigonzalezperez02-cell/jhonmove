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

## Despliegue Vercel (proyecto único)

El repo está configurado para desplegar **solo el frontend** (Vite) como un proyecto único.

### En la pantalla de Vercel

1. **No** uses el preset **Services** / multiservicio.
2. En `frontend-jhon-move` haz clic en **Importar proyecto único**.
3. Confirma:
   - Framework: **Vite**
   - Root Directory: `frontend-jhon-move`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. En **Environment Variables** agrega:
   - `VITE_API_URL` = URL pública de tu backend (sin `/` al final), por ejemplo `https://tu-api.onrender.com`

Si importas desde la raíz del repo, el `vercel.json` de la raíz ya apunta al frontend.

### Backend

Vercel no aloja el Express de este proyecto. Despliega `backend-jhon-move` en Render/Railway/Clever Cloud y en su `.env` pon:

```env
FRONTEND_URL=https://tu-app.vercel.app
```

(acepta también cualquier `*.vercel.app` automáticamente).
