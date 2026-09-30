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

Frontend y backend son **dos proyectos Vercel separados**. No uses el preset Services.

### Frontend (`frontend-jhon-move`)

1. Importar proyecto único → carpeta `frontend-jhon-move`
2. Framework: **Vite**
3. Variable (opcional si ya está el default en código):
   - `VITE_API_URL` = `https://jhonmove-rho.vercel.app`

### Backend (`backend-jhon-move`)

1. Importar proyecto único → carpeta `backend-jhon-move`
2. Root Directory: `backend-jhon-move`
3. En **Settings → General / Build & Development**:
   - Install Command: `npm install` (o vacío / default)
   - **Quita** cualquier comando con `--prefix frontend-jhon-move`
4. Variables de entorno:

```env
MYSQL_ADDON_HOST=...
MYSQL_ADDON_DB=...
MYSQL_ADDON_USER=...
MYSQL_ADDON_PORT=3306
MYSQL_ADDON_PASSWORD=...
JWT_SECRET=...
FRONTEND_URL=https://tu-frontend.vercel.app
```

5. Redeploy.
