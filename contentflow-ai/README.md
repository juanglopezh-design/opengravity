# ContentFlow AI

SaaS de generación de contenido con IA (Gemini), autenticación Firebase y planes de pago con Bitcoin.

## Stack

- **Next.js 15** (App Router) en [Render](https://render.com)
- **Firebase** Auth + Firestore
- **Google Gemini** para generación
- **Bitcoin** (verificación on-chain vía mempool.space)

## Desarrollo local

```bash
cp .env.example .env.local
# Completa las variables en .env.local
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Variables de entorno en Render

En el dashboard de Render → tu servicio → **Environment**, configura:

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `GEMINI_API_KEY` | Sí | API key de Google AI Studio |
| `FIREBASE_SERVICE_ACCOUNT` | Sí | JSON del service account (una línea) |
| `NEXT_PUBLIC_FIREBASE_*` | Sí | Config del proyecto Firebase (cliente) |
| `NEXT_PUBLIC_SITE_URL` | Sí | URL del servicio Render, ej. `https://contentflow-ai-ex6w.onrender.com` |
| `NEXT_PUBLIC_API_URL` | Sí | Misma URL que `NEXT_PUBLIC_SITE_URL` si todo corre en Render |
| `NEXT_PUBLIC_BTC_WALLET_ADDRESS` | Sí | Dirección BTC para checkout |
| `BTC_WALLET_ADDRESS` | Recomendada | Misma dirección (servidor) |
| `ALLOWED_ORIGINS` | Opcional | CORS adicionales separados por coma |

**Build command:** `npm ci && npm run build`  
**Start command:** `npm start`  
**Health check:** `/api/health`

## Firebase

1. Despliega reglas e índices:

```bash
firebase deploy --only firestore
```

2. En **Authentication → Settings → Authorized domains**, incluye tu URL de Render.

3. Si usas **Firebase Hosting** para el front, define en el build de Hosting:

```
NEXT_PUBLIC_API_URL=https://tu-servicio.onrender.com
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm start` | Servidor de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | Verificación TypeScript |

## Verificar producción

```bash
node test_online_endpoints.mjs
```

## Estructura principal

- `src/app/api/generate` — Generación con Gemini (auth + límites)
- `src/app/api/webhooks/crypto-verify` — Verificación de pagos BTC
- `src/app/dashboard` — Panel de usuario
- `src/lib/config.ts` — URLs, wallet y planes centralizados
