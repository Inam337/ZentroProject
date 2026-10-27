# Zentro Inventory Upgrade — what was built

Closes the gaps found in the inventory audit, step by step. Backend lives in `backend/myapp`, frontend in `frontend/myapp`.

**Demo:** open [`docs/inventory-demo.html`](./inventory-demo.html) in a browser. It runs the same rules (role guard, stock ledger, rollback on failure) in-page. It does **not** call the real API.

## How it was verified

| Check | Result |
|---|---|
| Backend `nest build` | Pass |
| Backend `jest` (10 tests: inventory ledger, role guard, existing spec) | Pass |
| Frontend `vite build` | Pass |
| Demo engine, scripted run (401 / 403 / oversell rollback / cancel restores stock) | Pass |
| **Live run against PostgreSQL + real HTTP** | **Not done** (no database was running in this session) |

Run the live smoke test yourself before merging (checklist at the bottom).

---

## Backend

### Step 1 — Admin-only HTTP routes (security)
- New `src/auth/roles.decorator.ts` (`@Roles`, `@AdminOnly()`) and `src/auth/roles.guard.ts`.
- The guard reads the caller's **current role and status from the database**, not from the token. Demoting or deactivating a user takes effect immediately.
- Responses: no token → `401`; shopper → `403`; deactivated admin → `403`.
- `@AdminOnly()` is applied to: customers, suppliers, stocks, purchases, purchase-items, sales, sale-items, users.
- On **products** and **categories**, only `POST` / `PUT` / `DELETE` are admin-only. `GET` stays public for the storefront.
- Each affected module now imports `AuthModule`.

### Step 2 — Stock updates automatically
New `src/inventory/inventory.service.ts` is the only code that changes quantities. It always runs inside the caller's DB transaction.

| Action | Stock effect |
|---|---|
| Create purchase | `+` each line |
| Edit purchase lines | Old lines reversed, new lines applied |
| Delete purchase | Quantities removed (rejected if already sold) |
| Create sale | `−` each line, **rejected if insufficient** |
| Edit / delete sale | Reverse, then re-apply / restore |
| Checkout order | `−` each line, **whole checkout rolls back if short** |
| Cancel order | Stock restored; un-cancelling deducts again |
| Delete non-cancelled order | Stock restored |

Only `goods` products are tracked. `service` and `digital` products are ignored.
Deduction drains locations in id order and takes a `pessimistic_write` lock to avoid races.

### Step 3 — Stock movement history
- New entity `StockMovement` (`stock_movements` table): product, signed `change`, `type`, `referenceId`, `userId`, `note`, `createdAt`.
- Types: `purchase`, `purchase_reversal`, `sale`, `sale_reversal`, `order`, `order_reversal`, `adjustment`.
- Manual edits through `/stocks` CRUD are logged as `adjustment`.

### Step 4 — Stock model
- Duplicate product + location is rejected with `409` (checked in `StockService`, so existing dirty data cannot block startup).
- `GET /stocks/summary` — total, value and `ok | low | out` status per product.
- `GET /stocks/low` — only low or out-of-stock products.

### Step 5 — Reports
- `GET /reports/dashboard` — stock value and units, low / out counts, sales and purchases (today and 30 days), orders by status, top 5 products.
- `GET /reports/sales-purchases?from=&to=` — zero-filled daily series (defaults to the last 30 days).

### Step 6 — Pagination and search (opt-in)
- `GET /stocks/movements?page=&limit=&productId=&type=` — always paginated (`{ data, total, page, limit, pages }`).
- `GET /stocks?page=&limit=&search=` — paginated **only when `page` is sent**. Without it you still get the plain array, so nothing existing breaks.

### Step 7 — Business rules
- Sales can be linked to a customer: optional `customerId` on `POST /sales`. Responses include `customer`.
- Unknown customer id returns `400`.

### Step 8 — Production hardening (partial)
- `synchronize` is now **off when `NODE_ENV=production`**. SQL logging is off unless `DB_LOGGING=true`.
- First unit tests added for the ledger and the role guard.

### New and changed endpoints

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/stocks/summary` | admin | per-product totals and status |
| GET | `/stocks/low` | admin | reorder alerts |
| GET | `/stocks/movements` | admin | paginated audit trail |
| GET | `/reports/dashboard` | admin | KPI snapshot |
| GET | `/reports/sales-purchases` | admin | daily series |
| POST | `/sales` | admin | now accepts `customerId`, deducts stock |
| POST | `/purchases` | admin | now adds stock |
| POST | `/orders/checkout` | any user | now deducts stock, `400` if insufficient |

---

## Frontend

| Gap | Delivered |
|---|---|
| Dashboard had no data | `AdminDashboardPanel`: KPI cards, 30-day sales vs purchases chart (dependency-free), reorder list, top products. Shown to admins on `/dashboard`. |
| No low-stock alerts | Reorder list on the dashboard and an **Inventory & alerts** page. |
| No reports / export | **CSV export** of stock levels (`libs/csv.ts`, Excel-safe UTF-8). |
| No movement history | **Movement history** tab with server-side pagination and a type filter. |
| Forms ignored stock | Sales form shows on-hand stock per line, flags over-selling, blocks submit, and has a customer picker. The table shows the customer. |

New route: `/admin/inventory` (sidebar: Admin → "Inventory & alerts"), English and Urdu menu labels added.
New files: `models/Inventory.ts`, `services/inventory.ts`, `libs/csv.ts`, `components/admin/AdminDashboardPanel.tsx`, `pages/admin/AdminInventoryPage.tsx`.

---

## Follow-up round (also done)

- **Order status hole closed:** a shopper can now only set their own order to `cancelled`. Any other status needs an admin (`403` otherwise). The frontend never used that route, so nothing breaks.
- **Real migration:** `src/migrations/1761500000000-AddStockMovementsAndSaleCustomer.ts` creates `stock_movements` and `sale.customerId` (idempotent). Run it with `pnpm run migration:run` (env vars as in `.env`; `migration:revert` undoes it). The two old migration files were empty and are untouched.
- **Sale price defaults to catalog price:** `unitPrice` is now optional on sale lines; omit it and the product price is used. Sending it still works as a discount override.
- **Invoice printing:** a "Print invoice" link on each row of the Sales table opens a print-ready invoice (customer, lines, total).

- **Pagination on purchases and sales:** `GET /purchases?page=&limit=` and `GET /sales?page=&limit=` return `{ data, total, page, limit, pages }` when `page` is sent (limit max 100, default 20). Without `page` they return the plain array, so the current admin screens are unchanged.

- **Helmet + rate limiting:** security headers on every response (CSP is off because the API also serves the Swagger/Scalar pages; cross-origin reads allowed for the SPA). Throttling: 300 requests/min/IP globally, 10/min on `/auth/login` and `/auth/register` (`429` when exceeded). New packages: `helmet`, `@nestjs/throttler`.
- **Purchase and sale status:** both now have `status` (`completed` | `cancelled`). `POST /purchases/:id/cancel` and `POST /sales/:id/cancel` reverse the stock but keep the record for audit. Cancelled documents cannot be edited, deleting them does not reverse stock twice, and the dashboard/report numbers ignore them. The Sales and Purchases tables show a status badge and a Cancel link. The migration was extended with the two `status` columns.

- **Full admin dashboard:** 8 stat cards, a 7/30/90-day range switch, sales-vs-purchases bars, a cumulative net cash-flow area graph, stock-health and orders-by-status donuts, stock value by category, needs-reordering, top products and recent stock activity. Charts are plain SVG (no new dependency) in `components/admin/charts.tsx`. New endpoint `GET /reports/stock-by-category`. The panel sits inside a `PanelErrorBoundary` so a widget failure cannot blank the page.
- **Card tints:** each stat card and panel has a light gradient from the Zentro palette (teal, mint, sand, amber, rose, slate) with a thin accent bar. Colour follows meaning: Low stock turns amber, Net cash flow turns rose when negative, Needs reordering turns rose only when something is low. Text stays dark ink or 700-weight tones, and secondary text is gray-600, so pairings stay at or above 4.5:1.
- **Storefront Products as a data table:** `/products` is now a full-width grid with sortable columns (product, SKU, category, price, unit, stock), pagination (10/25/50/100 per page), and filters for search, category chips, stock status (in / low / out) and min/max price, with a Clear filters button. A Table / Cards toggle keeps the old card layout. The dashboard now uses the full content width instead of a fixed max width.
- **Invoices list** (`/admin/invoices`, Admin → Invoices): every sale as an invoice (`INV-00048`), with summary cards (count, total invoiced, average, cancelled), search by number or customer, status and date-range filters, sortable columns, pagination, View/Print and Cancel. Printed invoices use the same number and show CANCELLED when applicable.
- **Remove from stock (write-off):** `POST /stocks/write-off` (admin) takes `{ productId, quantity, reason }`, removes the units, rejects over-removal (400), and logs an `adjustment` movement with the reason. UI: a **Remove stock** link on each row of Inventory & alerts opens a drawer asking for quantity and reason.
- **Near out of stock chart:** the dashboard shows a horizontal bar chart (stock vs reorder level, red = out, amber = low) instead of cards. **Stock alerts** (`/admin/stock-alerts`) is the full-detail page: summary cards, the complete chart, filterable/sortable/paginated table, CSV export, Restock links.
- **Dashboard redesign:** gradient welcome banner with greeting and date, tinted shortcut and admin-tool cards. Donut/pie charts use stacked layouts (Stock health donut, Orders pie) so the row has no dead space.
- **Top bar redesign:** eyebrow + page title, custom language dropdown, cart pill with badge, profile menu with gradient avatar, name/role and a header card. Dropdowns close on outside click and Escape. Page titles added for Inventory, Invoices and Stock alerts.
- **Product detail and Checkout redesigned:** product page has a visual panel, price/stock bar, quantity stepper with live total, Add to cart / Buy now, specifications, stock by location and related products; checkout has a step indicator, itemised review and a sticky order summary.
- **Dev proxy fix:** `reports` was missing from the Vite proxy list in `vite.config.ts`, so `/reports/*` returned the app HTML in dev. Add new API prefixes there. The proxy also now lets browser page loads (Accept: text/html) of `/products`, `/orders`, `/categories`, `/cart` fall through to the app, so a hard refresh no longer shows raw API JSON.

The migration, the order-status rule, pagination, throttling and cancel were checked by build only, not against a live database.

## Not done yet

- **Live end-to-end test** against Postgres (see below).
- **Pagination on the products list**, and switching the admin tables to server-side paging (the backend supports it; the screens still page in the browser).
- **Payment tracking** on sales and purchases, and a draft/received stage before stock moves.
- **Barcode scanning, product images, audit-log screen, E2E tests, payment webhooks.**
- **Frontend type-check:** `tsc` already reports errors on existing pages (`strictNullChecks: false` breaks union narrowing, plus a `Select.tsx` casing clash). My files add no new kinds of error; the Vite build is clean.

## Live smoke test (needs Postgres + API running)

```bash
docker compose up -d db
cd backend/myapp && pnpm run start:dev      # creates stock_movements, sale.customerId
pnpm run seed:demo
```

0. Run `pnpm run migration:run` on a production-like DB (or let dev `synchronize` create the schema).
1. `GET /customers` with no token → `401`; with `shopper@zentro.demo` → `403`; with `admin@zentro.demo` → `200`.
2. `POST /purchases` for a product → `GET /stocks/summary` quantity rises by the purchased amount.
3. `POST /sales` with a quantity above on-hand → `400 Insufficient stock`, and nothing changes.
4. Shopper: add to cart → `POST /orders/checkout` → stock drops. Set order to `cancelled` → stock returns.
5. `GET /stocks/movements` shows one row per step above.
5a. `POST /sales/:id/cancel` → stock returns, status `cancelled`, dashboard totals drop; cancelling again → `400`.
5b. Eleven rapid `POST /auth/login` calls from one IP → the 11th returns `429`.
6. Open `/dashboard` as admin: KPIs, chart and reorder list render. Open `/admin/inventory`.
