# CV Builder

Aplicación Angular + API Node para crear y descargar currículums, con persistencia en **MongoDB Atlas** y usuarios (`userId`).

## Características

- **Auth multi-usuario** (registro / login JWT)
- **CVs en MongoDB** asociados a cada `userId`
- **Múltiples CVs** por usuario, con copia/renombrar/eliminar
- **5 plantillas** personalizables
- **PDF** con texto seleccionable (impresión nativa)

## Requisitos

- Node.js 20+
- pnpm
- Cluster MongoDB Atlas (Network Access: IP permitida)

## Configuración API

```bash
cd server
cp .env.example .env
# Edita MONGODB_URI y JWT_SECRET
pnpm install --ignore-workspace
```

Variables en `server/.env`:

- `MONGODB_URI` — connection string de Atlas
- `JWT_SECRET` — secreto largo aleatorio
- `CLIENT_ORIGIN` — `http://localhost:4200` en local
- `PORT` — `3000` por defecto
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — OAuth de Google Cloud Console (solo en `server/.env`, nunca en el frontend)

En Google Cloud Console, añade como **Authorized JavaScript origins**:
- `http://localhost:4200`

El Client ID se sirve en runtime vía `GET /api/auth/config` (no va hardcodeado en el repo).

## Arranque local

### Opción A — terminal personalizada (recomendado)

```bash
pnpm install
pnpm dev
```

Abre **mprocs**: dos paneles (`api` / `web`) que controlas por separado.

| Tecla | Acción |
|-------|--------|
| `Tab` / ↑↓ | Cambiar de proceso |
| `r` | Reiniciar solo ese proceso |
| `x` | Parar ese proceso |
| `q` | Salir de todo |

### Opción B — terminales divididas en Cursor

1. `Ctrl+Shift+B` (o **Terminal → Run Task… → Run**)
2. Se abren **dos terminales split**: `api` (:3000) y `web` (:4200)
3. Cada una se para/reinicia sola (botón papelera / relanzar task)

### Opción C — dos terminales manuales

```bash
pnpm run start:api   # terminal 1
pnpm start           # terminal 2
```

Abre [http://localhost:4200](http://localhost:4200), regístrate y empieza a editar.
Los cambios se guardan en MongoDB automáticamente.

## API

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Crear cuenta |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Usuario actual |
| GET | `/api/cvs` | Listar CVs del usuario |
| POST | `/api/cvs` | Crear CV |
| PUT | `/api/cvs/:id` | Actualizar CV |
| DELETE | `/api/cvs/:id` | Eliminar CV |
| POST | `/api/cvs/:id/duplicate` | Duplicar CV |

## Seguridad

- No subas `server/.env` al repositorio
- Si has compartido la contraseña de MongoDB en un chat o captura, **rótala** en Atlas
- En producción usa HTTPS y un `JWT_SECRET` fuerte

## Build frontend

```bash
pnpm run build
```
