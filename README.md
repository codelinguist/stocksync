# Stock Sync

A focused stock operations exercise with a Spring Boot API in `backend/` and a Next.js dashboard in `frontend/`. The service imports inventory from REST and CSV vendor feeds, normalizes it into H2, records positive-to-zero stock transitions, and supports scheduled or operator-triggered synchronization.

## Stock Operations Dashboard

The frontend provides:

- inventory totals for products, availability, and vendors
- a read-only product catalog
- case-insensitive SKU and product-name search
- vendor and stock-status filtering
- recent stock-out alerts
- manual synchronization with automatic inventory and alert refreshes

The scope is intentionally small: it demonstrates a complete operational workflow without authentication, editing, charts, or a large component framework.

See the [frontend README](frontend/README.md) for its libraries, architectural patterns, state-management decisions, and UI practices.

## Technology

| Area | Technology |
| --- | --- |
| Backend | Java 17, Spring Boot, Spring MVC, Spring Data JPA |
| Vendor integration | Spring `RestClient`, Apache Commons CSV, Spring Retry |
| Frontend | Next.js App Router, React, TypeScript, Tailwind CSS |
| Server state | Redux Toolkit and RTK Query |
| Storage | In-memory H2 |
| API documentation | OpenAPI and Swagger UI |

## Running locally

Requirements:

- Java 17 or newer
- Node.js 20.9 or newer
- npm

The Maven wrapper is included, so a separate Maven installation is not required.

### 1. Start the backend

From the repository root:

```bash
cd backend
mkdir -p /tmp/vendor-b
cp sample-data/vendor-b/stock.csv /tmp/vendor-b/stock.csv
./mvnw spring-boot:run
```

The first synchronization starts after five seconds. Later scheduled runs start 60 seconds after the previous run completes.

### 2. Start the frontend

In a second terminal, from the repository root:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

The required frontend environment value is:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Open `http://localhost:3000`. Once the initial backend synchronization completes, the dashboard displays inventory from both vendors.

### Try the complete workflow

Search or filter the product table directly in the dashboard. To create a stock-out alert, change a currently positive quantity to `0` in `/tmp/vendor-b/stock.csv`, then click **Sync Now**. The backend records the transition and RTK Query automatically refreshes the product catalog and recent alerts.

Inventory is deliberately read-only in the UI. Vendor feeds are the authoritative stock sources, so operational changes are demonstrated by changing the simulated vendor input rather than editing normalized products.

## API

- `GET http://localhost:8080/products` — normalized current inventory
- `GET http://localhost:8080/stock-events` — positive-to-zero transitions, newest first
- `POST http://localhost:8080/sync` — run the existing all-vendor synchronization operation
- `GET http://localhost:8080/mock/vendor-a/stock` — bundled Vendor A simulation
- `GET http://localhost:8080/swagger-ui.html` — Swagger UI
- `GET http://localhost:8080/v3/api-docs` — OpenAPI JSON

## Backend service

Vendor A is a real HTTP integration implemented with Spring `RestClient`. A bundled mock endpoint keeps the exercise self-contained; it can be disabled when pointing the client at an external service. Transient REST failures are retried three times with configurable backoff.

Vendor B reads `/tmp/vendor-b/stock.csv` with this format:

```csv
sku,name,stockQuantity
B-100,4K Webcam,12
```

Apache Commons CSV handles quoted names and standard CSV escaping. `VENDOR_B_FILE_PATH` can point the adapter at another drop location.

Each vendor is fetched and committed independently. A source failure is logged and does not prevent other vendors from synchronizing. Both the scheduler and `POST /sync` call the same orchestration method, so fetching, validation, persistence, and stock-transition behavior are not duplicated.

A stock event is stored only when an existing product changes from a positive quantity to zero. An initially zero product is not a transition; replenishing it and later returning to zero creates a new event.

## Frontend architecture

RTK Query manages remote API state, caching, loading and error lifecycles, the synchronization mutation, and tag-based invalidation. Successful synchronization invalidates both product and stock-event data, causing active queries to refetch automatically.

Transient interface state—search text, selected vendor, and selected stock status—remains local to React components. API data is not copied into another Redux slice, and there is no global UI-state slice.

The UI does not provide inventory editing because the REST and CSV vendor integrations are authoritative. This keeps the frontend aligned with the backend synchronization model and avoids presenting normalized data as a second source of truth.

## Configuration

| Environment variable | Default | Purpose |
| --- | --- | --- |
| `STOCK_SYNC_INITIAL_DELAY_MS` | `5000` | Delay before the first synchronization |
| `STOCK_SYNC_FIXED_DELAY_MS` | `60000` | Delay between completed synchronizations |
| `FRONTEND_ORIGIN` | `http://localhost:3000` | Browser origin allowed to call the API |
| `VENDOR_A_BASE_URL` | `http://localhost:8080` | Vendor A server |
| `VENDOR_A_STOCK_PATH` | `/mock/vendor-a/stock` | Vendor A stock resource |
| `VENDOR_A_MOCK_ENABLED` | `true` | Enables the bundled Vendor A endpoint |
| `VENDOR_A_RETRY_MAX_ATTEMPTS` | `3` | REST call attempts |
| `VENDOR_A_RETRY_DELAY_MS` | `500` | Delay between attempts |
| `VENDOR_B_FILE_PATH` | `/tmp/vendor-b/stock.csv` | Vendor B CSV drop |

## Verification

Backend:

```bash
cd backend
./mvnw test
```

Frontend:

```bash
cd frontend
npm run lint
npm run typecheck
npm run build
```

No frontend test runner is configured; the production build performs the framework compilation in addition to the explicit TypeScript check.

## Docker

The backend image includes the sample Vendor B feed:

```bash
docker build -t stock-sync-service backend
docker run --rm -p 8080:8080 stock-sync-service
```

## Design decisions and trade-offs

- Vendors are normalized into a `vendors` table. Products are uniquely identified by `(vendor_id, sku)`, so identical SKUs from different vendors remain distinct records.
- Missing feed rows are retained rather than treated as deletions or implicit zero quantities because a vendor response may be partial.
- H2 is intentionally in-memory, so inventory and alerts reset when the backend restarts.
- Filtering is client-side because the exercise dataset is deliberately small.
- Authentication and authorization are outside the exercise scope.
- A production service would use persistent storage, schema migrations, observability, authorization, and stronger controls for manual synchronization such as audit records, concurrency protection, and per-vendor results.
- Multi-replica scheduling would require a distributed lock; the current scheduler is intentionally single-process.

### SaaS and multi-tenancy consideration not implemented

For a SaaS version, `vendor_id` could act as the tenant identifier in composite keys such as `(vendor_id, product_id)` and `(vendor_id, event_id)`. Leading indexes and foreign keys with the tenant identifier make tenant-scoped lookups seek into a contiguous key range, improve cache locality, and let the database prevent cross-tenant relationships. Tenant-local serial values would require a concurrency-safe per-tenant sequence or counter.

This layout can reduce the rows and pages touched by tenant-scoped operations, shortening lock lifetimes and lowering lock pressure. It does not guarantee that lock escalation cannot occur: escalation is database-specific, and some engines may still escalate many row or page locks. Where supported, partitioning and partition-level locking by tenant can provide stronger isolation, but queries and indexes must consistently lead with the tenant identifier.

## Repository structure

- `backend/src/main/java/.../vendor` — source adapters and normalized vendor DTO
- `backend/src/main/java/.../service` — synchronization orchestration and inventory rules
- `backend/src/main/java/.../domain` and `repository` — relational model and persistence
- `backend/src/main/java/.../web` — inventory, stock-event, synchronization, mock, and error endpoints
- `frontend/src/app` — App Router shell and Redux provider
- `frontend/src/features/inventory` — dashboard, filtering, alerts, and sync controls
- `frontend/src/lib` — Redux store and typed RTK Query API
