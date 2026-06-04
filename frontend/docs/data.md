# Mock users and demo data (frontend)

Use backend demo seed data when building catalog, cart, checkout, and admin screens so the UI is populated on day one.

**Full dataset reference:** [`backend/myapp/docs/data.md`](../../backend/myapp/docs/data.md)

---

## Commands

Run from **`backend/myapp`** (not `frontend/myapp`):

| Command | Description |
|---------|-------------|
| `pnpm run seed:demo` | Load mock data (skips if already seeded) |
| `pnpm run seed:demo:fresh` | Wipe demo commerce data and re-seed |
| `pnpm run seed` | Same as `seed:demo` |
| `pnpm run seed:fresh` | Same as `seed:demo:fresh` |
| `pnpm run mock:seed` | Same as `seed:demo` |
| `pnpm run mock:seed:fresh` | Same as `seed:demo:fresh` |

```bash
cd backend/myapp
pnpm run start:dev    # first time: creates DB tables
pnpm run seed:demo    # mock users + shop data
```

---

## Mock logins (for UI / Scalar)

| Email | Password | Role |
|-------|----------|------|
| `shopper@zentro.demo` | `ShopDemo123!` | user — has cart + 2 orders |
| `admin@zentro.demo` | `ShopDemo123!` | admin |

> Registering `admin@zentro.com` will fail with **409** if that email already exists in the database. Use a new email or log in instead.

**API base (dev):** leave `VITE_API_BASE_URL` empty in `.env.development` (Vite proxy → `http://localhost:3000`)  
**Login:** `POST /auth/login` → use `token` in `Authorization: Bearer …`

---

## What you get for UI

- **12 products** across 4 categories (goods, service, digital)
- **Stock** with low-inventory items (milk, soap) for badges
- **Active cart** for shopper (earbuds + mango juice)
- **Order history** — one paid/confirmed, one pending
- **Customers, supplier, purchase, sale** for admin/inventory pages

See the [backend data doc](../../backend/myapp/docs/data.md) for SKU tables, order line details, and `curl` examples.

---

## Related

- [Phase 0 dev setup](./dev-setup.md)
- [Frontend integration plan](./architecture.md)
- [Backend API reference](../../backend/myapp/docs/api-reference.md)
