# Stock Sync

A small stock operations application with a Spring Boot API in `backend/` and a Next.js frontend in `frontend/`. The backend periodically imports stock from a REST vendor and a CSV vendor, stores the latest inventory in H2, records positive-to-zero stock transitions, and exposes the normalized product catalog.

## Requirements

- Java 17 or newer
- Maven 3.9+
- Node.js 20.9 or newer
- npm

## Run the backend locally

Prepare the simulated Vendor B drop and start the application:

```bash
cd backend
mkdir -p /tmp/vendor-b
cp sample-data/vendor-b/stock.csv /tmp/vendor-b/stock.csv
mvn spring-boot:run
```

The first sync runs after five seconds and subsequent syncs run 60 seconds after the previous run completes.

- Products: `GET http://localhost:8080/products`
- Stock events: `GET http://localhost:8080/stock-events`
- Manual synchronization: `POST http://localhost:8080/sync`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- Simulated Vendor A response: `http://localhost:8080/mock/vendor-a/stock`

Run backend tests from `backend/` with `mvn test`.

## Run the frontend

The frontend is a Next.js application in `frontend/`. Its Inventory Dashboard summarizes current availability, lists normalized products, shows recent stock alerts, and allows an operator to trigger synchronization.

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. By default, the frontend is configured to use the backend at `http://localhost:8080` through `NEXT_PUBLIC_API_BASE_URL`.

## Run with Docker

From the repository root:

```bash
docker build -t stock-sync-service backend
docker run --rm -p 8080:8080 stock-sync-service
```

## Vendor simulation

Vendor A is a real HTTP integration implemented with Spring `RestClient`. For a self-contained exercise, the service also exposes a small mock controller at `/mock/vendor-a/stock`, enabled by default. Point it at a real or standalone mock server with `VENDOR_A_BASE_URL` and disable the bundled endpoint with `VENDOR_A_MOCK_ENABLED=false`. Transient REST client failures are retried three times with a configurable backoff.

Vendor B reads `/tmp/vendor-b/stock.csv` using this header:

```csv
sku,name,stockQuantity
B-100,4K Webcam,12
```

Override the path with `VENDOR_B_FILE_PATH`. Apache Commons CSV is used so quoted names and standard CSV escaping work correctly.

## Configuration

| Environment variable | Default | Purpose |
| --- | --- | --- |
| `STOCK_SYNC_INITIAL_DELAY_MS` | `5000` | Delay before the first sync |
| `STOCK_SYNC_FIXED_DELAY_MS` | `60000` | Delay between completed syncs |
| `FRONTEND_ORIGIN` | `http://localhost:3000` | Browser origin allowed to call the products, stock-events, and synchronization APIs |
| `VENDOR_A_BASE_URL` | `http://localhost:8080` | Vendor A server |
| `VENDOR_A_STOCK_PATH` | `/mock/vendor-a/stock` | Vendor A stock resource |
| `VENDOR_A_MOCK_ENABLED` | `true` | Enables the bundled mock endpoint |
| `VENDOR_A_RETRY_MAX_ATTEMPTS` | `3` | REST call attempts |
| `VENDOR_A_RETRY_DELAY_MS` | `500` | Delay between attempts |
| `VENDOR_B_FILE_PATH` | `/tmp/vendor-b/stock.csv` | Vendor B CSV drop |

## Design decisions and trade-offs

- Vendors are normalized into a `vendors` table with a unique `name`. Products and out-of-stock events reference a vendor by foreign key; the API still returns the vendor name for a convenient response shape.
- A product is uniquely identified by `(vendor_id, sku)`. The same SKU from two vendors remains two inventory records because the requirements do not define cross-vendor catalog matching or aggregation.
- Each vendor is fetched and committed independently. A missing CSV or exhausted REST retries is logged and does not prevent another source from updating.
- A zero-stock event is persisted only when an existing product changes from a positive value to zero. Importing an already-zero product is not considered a transition. Replenishing and later returning to zero creates a new event.
- The sync is an upsert snapshot of rows present in a feed. Missing rows are retained because absence could mean a partial vendor feed; no deletion or implicit zero is assumed.
- H2 is intentionally in-memory for the exercise, so data and events reset on restart. A production deployment would use PostgreSQL, schema migrations (Flyway/Liquibase), metrics/alert delivery, secret management, and distributed scheduling/locking if multiple replicas run.
- Spring's scheduler is single-process. Database uniqueness protects identity, but a production multi-replica deployment should add a distributed lock such as ShedLock.

### SaaS and multi-tenancy considerations not implemented

If this service were offered as a SaaS product, I would treat `vendor_id` as the tenant identifier and use tenant-scoped composite primary keys such as `(vendor_id, product_id)` and `(vendor_id, event_id)`, where the second value is unique within that tenant. Tenant identity would also be included in every relevant foreign key so the database, rather than application code alone, prevents relationships between different tenants.

Putting `vendor_id` first makes the primary-key index match the dominant access pattern: queries for one tenant can seek directly to a contiguous key range instead of scanning entries belonging to every tenant. In databases that cluster or physically organize rows by the primary key, it also keeps a tenant's rows close together, improving cache locality and reducing the number of index and data pages read. Tenant-local serial numbers produce compact indexes, although generating them safely under concurrency requires a per-tenant sequence or counter and careful handling of contention.

This key design can also reduce the number of rows and pages touched by tenant-scoped updates, which shortens lock lifetimes and lowers lock pressure. It does not, by itself, guarantee that lock escalation cannot occur: escalation rules vary by database, and some engines escalate many row or page locks to a table or partition lock regardless of key shape. On a database that supports partition-level locking and escalation, partitioning by `vendor_id` can further isolate tenants. In all cases, queries and indexes must consistently lead with `vendor_id`; otherwise broad scans can still create cross-tenant contention and weaken data isolation.

## Package structure

- `backend/src/main/java/.../vendor`: source adapters and normalized vendor DTO
- `backend/src/main/java/.../service`: synchronization orchestration and inventory business rules
- `backend/src/main/java/.../repository` and `domain`: normalized relational persistence for vendors, products, and events
- `backend/src/main/java/.../web`: products, stock-events, and synchronization APIs, mock Vendor A endpoint, and API error mapping
- `frontend/src/app`: Next.js App Router shell
- `frontend/src/lib`: Redux store and RTK Query base configuration
