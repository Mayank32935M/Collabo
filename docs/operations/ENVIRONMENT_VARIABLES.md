# Environment Variables Reference — COLLABO

> **Document Status:** Approved (Milestone M1.5 Specification)  
> **Security Notice:** Never commit `.env` or `.env.local` files containing real production secrets to Git.

---

## 1. Overview & Setup

COLLABO manages environment variables per application workspace:
* `apps/web/.env.local`: Web application, Supabase client, and LiveKit public URLs.
* `apps/realtime/.env`: Real-time control server port and CORS configuration.

To configure your local environment, copy the root template:
```bash
cp .env.example apps/web/.env.local
cp .env.example apps/realtime/.env
```

---

## 2. Web Application (`apps/web`) Variables

| Variable Name | Required? | Default / Example | Description | Security |
|---|:---:|---|---|:---:|
| `NODE_ENV` | No | `development` | Runtime environment (`development`, `production`, `test`). | Public |
| `PORT` | No | `3000` | Port for the local Next.js development server. | Public |
| `NEXT_PUBLIC_APP_URL` | Yes | `http://localhost:3000` | Public base URL of the web application. | Public |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | `https://xyz.supabase.co` | Supabase project API gateway endpoint. Falls back to in-memory store if unset. | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | `eyJhbGci...` | Public anonymous key for client-side queries subject to RLS. | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | `eyJhbGci...` | Elevated service role key for admin route handlers (never expose to browser). | 🔒 Secret |
| `NEXT_PUBLIC_SOCKET_SERVER_URL` | Optional | `http://localhost:4000` | URL of the dedicated `apps/realtime` Socket.IO control server. | Public |
| `NEXT_PUBLIC_LIVEKIT_URL` | Optional | `wss://collabo.livekit.cloud` | WebRTC SFU gateway endpoint for audio and screen sharing. | Public |
| `LIVEKIT_API_KEY` | Optional | `APIxxxxxx` | Server-side key to generate participant tokens. | 🔒 Secret |
| `LIVEKIT_API_SECRET` | Optional | `secretxxxxxx` | Secret for cryptographic token signing. | 🔒 Secret |
| `GEMINI_API_KEY` | Optional | `AIzaxxxxx` | Google Gemini API key for COLLABO Intelligence features. | 🔒 Secret |

---

## 3. Real-Time Control Plane (`apps/realtime`) Variables

| Variable Name | Required? | Default / Example | Description | Security |
|---|:---:|---|---|:---:|
| `PORT` | No | `4000` | Port on which the Socket.IO HTTP server listens. | Public |
| `CORS_ORIGIN` | No | `*` (Dev) / `https://collabo.edu` | Allowed origins for cross-origin WebSocket connections. | Public |
| `REDIS_URL` | Optional | `redis://localhost:6379` | Connection string for multi-instance Redis Pub/Sub adapter. | 🔒 Secret |

