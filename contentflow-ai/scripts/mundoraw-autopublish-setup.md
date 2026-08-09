# MundoRaw AutoPublish Bot — Setup

## ¿Qué hace?
Cada vez que subes un video a @mundoraw, este bot:
1. Lo detecta automáticamente
2. Genera un tweet, hilo y caption de Instagram con IA
3. Autopublica en Twitter/X e Instagram
4. Guarda un log de todo lo publicado

## Comandos

```bash
# Probar sin publicar (dry run)
node scripts/mundoraw-autopublish.mjs --dry-run

# Publicar el último video ahora mismo
node scripts/mundoraw-autopublish.mjs --force

# Monitoreo continuo (cada 30 min)
node scripts/mundoraw-autopublish.mjs --watch

# Publicar como hilo en lugar de tweet único
node scripts/mundoraw-autopublish.mjs --force --thread
```

## Setup Twitter/X (5 minutos)

1. Ve a https://developer.twitter.com/en/portal/dashboard
2. Crea una app (o usa una existente)
3. En "User authentication settings": activa OAuth 1.0a con permisos Read and Write
4. Ve a "Keys and Tokens" → genera Access Token & Secret
5. Añade al .env.local:

```
TWITTER_API_KEY=tu_consumer_key
TWITTER_API_SECRET=tu_consumer_secret
TWITTER_ACCESS_TOKEN=tu_access_token
TWITTER_ACCESS_SECRET=tu_access_token_secret
```

## Setup Instagram (10 minutos)

Instagram solo permite publicar via API en cuentas de negocio/creador conectadas a Facebook.

1. Convierte tu cuenta Instagram en "Cuenta de Creador" (Configuración → Cuenta → Cambiar a cuenta de creador)
2. Conecta tu Instagram a una página de Facebook
3. Ve a https://developers.facebook.com → Crea una app de tipo "Business"
4. Añade el producto "Instagram Graph API"
5. Genera un token de larga duración
6. Añade al .env.local:

```
INSTAGRAM_ACCESS_TOKEN=tu_token_de_larga_duracion
INSTAGRAM_BUSINESS_ID=tu_instagram_business_account_id
```

## Automatización 24/7 (sin tener el PC encendido)

### Opción A — Render Cron Job (recomendado, gratis)
1. Ve a dashboard.render.com → New → Cron Job
2. Command: `node scripts/mundoraw-autopublish.mjs`
3. Schedule: `0 * * * *` (cada hora)
4. Añade las env vars de Twitter e Instagram en Render

### Opción B — GitHub Actions (gratis)
Crea `.github/workflows/autopublish.yml` con schedule `0 */2 * * *`

## Variables de entorno necesarias

| Variable | Obligatoria | Descripción |
|---|---|---|
| YOUTUBE_API_KEY | Ya configurada | Para leer el canal |
| GEMINI_API_KEY | Ya configurada | Para generar contenido |
| TWITTER_API_KEY | Para Twitter | Consumer Key |
| TWITTER_API_SECRET | Para Twitter | Consumer Secret |
| TWITTER_ACCESS_TOKEN | Para Twitter | Access Token |
| TWITTER_ACCESS_SECRET | Para Twitter | Access Token Secret |
| INSTAGRAM_ACCESS_TOKEN | Para Instagram | Graph API Token |
| INSTAGRAM_BUSINESS_ID | Para Instagram | ID cuenta negocio |
