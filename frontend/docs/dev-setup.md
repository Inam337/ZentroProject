# Phase 0 — Local dev setup (complete)

Backend and frontend run locally; **cross-origin** uses **NestJS CORS (Option A)** — not a Vite proxy.

| Environment | Strategy |
|-------------|----------|
| **Development** | `app.enableCors()` in `backend/myapp/src/main.ts` allows `http://localhost:5173` (and preview `:4173`) |
| **Production** | Set `CORS_ORIGINS` on the API to your deployed SPA origin; set `VITE_API_BASE_URL` at frontend build time |

---

## 1. Backend (`backend/myapp`)

```bash
cd backend/myapp
pnpm install
# Optional: copy .env.example → .env and adjust DB_* / JWT_*

pnpm run start:dev
```

| Check | URL / command |
|-------|----------------|
| Health | [http://localhost:3000/](http://localhost:3000/) |
| Scalar API | [http://localhost:3000/reference](http://localhost:3000/reference) |
| Swagger | [http://localhost:3000/swagger](http://localhost:3000/swagger) |

**Mock data (optional):**

```bash
pnpm run seed:demo
```

See [data.md](./data.md) for demo users (`shopper@zentro.demo` / `ShopDemo123!`).

---

## 2. Frontend (`frontend/myapp`)

```bash
cd frontend/myapp
pnpm install
# .env.development should contain:
#   VITE_API_BASE_URL=http://localhost:3000

pnpm dev
```

| Check | URL |
|-------|-----|
| App | [http://localhost:5173](http://localhost:5173) |
| Login route | [http://localhost:5173/login](http://localhost:5173/login) |

---

## 3. Verify CORS (browser → API)

With the API running:

```bash
curl -s -o NUL -w "%{http_code}" -X OPTIONS http://localhost:3000/auth/login ^
  -H "Origin: http://localhost:5173" ^
  -H "Access-Control-Request-Method: POST"
```

Expect `204` or `200` and response headers including `Access-Control-Allow-Origin`.

Or in the browser DevTools → Network: after login work in Phase 2, requests to `localhost:3000` should not show CORS errors.

---

## 4. Environment variables

**Auth 500 fix:** `backend/myapp/.env` must include `JWT_REFRESH_SECRET` (not only `JWT_SECRET`). Restart the API after changing `.env`.

| App | File | Variable | Dev value |
|-----|------|----------|-----------|
| Frontend | `.env.development` | `VITE_API_BASE_URL` | *(empty — uses Vite proxy to :3000)* |
| Frontend | `.env.development` | `VITE_API_PROXY_TARGET` | `http://localhost:3000` |
| Frontend | `.env.production` | `VITE_API_BASE_URL` | Your production API URL |
| Backend | `.env` (required for auth) | `JWT_SECRET`, `JWT_REFRESH_SECRET` | See `backend/myapp/.env.example` |
| Backend | `.env` (optional) | `CORS_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` |
| Backend | `.env` (optional) | `DB_*` | See `backend/myapp/.env.example` |

---

## Phase 0 checklist

- [x] PostgreSQL + API start (`pnpm run start:dev`)
- [x] `GET /` health check
- [x] Scalar at `/reference`
- [x] Frontend `pnpm dev` on port 5173
- [x] `VITE_API_BASE_URL` set for dev
- [x] CORS enabled on Nest for Vite origin
- [x] Production note: `CORS_ORIGINS` + build-time `VITE_API_BASE_URL`

**Phase 2 auth smoke test** (from `frontend/myapp`, backend must be running):

```bash
pnpm run verify:auth
```

Next: **[architecture.md](./architecture.md)** Phase 3 (models + service stubs).
