# Zentro Dashboard & UI — requirements delivered

Frontend work in `frontend/myapp`. Backend and inventory rules are covered in [`INVENTORY_UPGRADE.md`](./INVENTORY_UPGRADE.md).

## Running the project

```bash
docker compose up -d --build
```

| Service | URL |
|---|---|
| Frontend (Vite) | http://localhost:5175 |
| Backend (NestJS) | http://localhost:3000 |
| Postgres 16 | localhost:5437 |

Demo admin login comes from the seed scripts in `frontend/myapp/scripts/` (`verify-seed.mjs`).

> **Dev note:** edits to bind-mounted source are not picked up by the Vite watcher on a Windows host, even with polling on in `vite.config.ts`. After code changes run `docker compose restart frontend`.

## Requirements

| # | Requirement | Where | Status |
|---|---|---|---|
| 1 | Stock health card: stylish segmented donut (rounded ends, gaps, gradients, hover) | `components/admin/charts.tsx` (`Donut`) | Done |
| 2 | Orders by status card: different chart and colours — concentric radial rings, blue / violet / rose, neutral card tint | `charts.tsx` (`variant="rings"`), `AdminDashboardPanel.tsx` | Done |
| 3 | Sidebar: pinned full-height on desktop, styled scrollbar with edge fade, collapsed flyout no longer clipped and on-brand | `layouts/AppSidebar.tsx`, `ui/NestingNav.tsx`, `styles/index.css` (`.sidebar-scroll`) | Done |
| 4 | Responsive sidebar: slide-in drawer below 1024px, max 85% screen width | `AppSidebar.tsx`, `use-mobile.ts` | Done |
| 5 | Responsive layout: no horizontal page overflow, smaller header and padding on phones | `layouts/MainLayout.tsx` | Partly verified (see below) |
| 6 | "View full details →" moved out of the legend into a footer button on Near out of stock | `admin/LowStockChart.tsx` | Done |
| 7 | Empty states: centered icon, title and hint matching each card or table | `ui/EmptyState.tsx`; used by `DataTable`, `ReportingDataTable`, `AccessibleDataTable`, `CommercePageState`, `ProductsPage`, dashboard panels | Done |
| 8 | Recent stock activity: show top 4, then a Show more / Show less button | `AdminDashboardPanel.tsx` (`MOVES_PREVIEW`) | Done |

## Empty states

`EmptyState` takes the existing one-line `emptyMessage` and derives the rest:

- **Icon** is inferred from the message (sales, products, orders, users, suppliers, customers, stock, categories, purchases, invoices, movements). Messages about filters get a search icon.
- **Title and hint**: a two-sentence message becomes title plus description; a single sentence gets a default hint for its kind.
- Override with the `kind`, `title` and `description` props. `compact` and `fill` size it for cards.

## Verification

| Check | Result |
|---|---|
| Dashboard in the browser at desktop width (charts, sidebar, footer button, empty states, Show more) | Checked |
| Sales table filtered to no results (empty state) | Checked |
| Dashboard and Admin Products in a 390px frame (no page-level overflow, tables scroll inside their container) | Checked |
| Every other route at phone width | **Not checked** |
| `tsc -b` | Existing errors in files outside this work (`ApiResult.error`, amplify, `Select` file-name casing); none in the new code |

## Known gaps

- Page titles in the header truncate on phones (for example "Das…") because the language, cart and profile buttons take the space.
- Phone-width review of the remaining pages (checkout, orders, admin tables and forms) is still open.
