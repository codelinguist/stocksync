# Stock Operations Frontend

The Stock Operations frontend is a small internal dashboard for reviewing normalized inventory from the Stock Sync Service. It shows inventory totals, provides product search and filtering, surfaces recent stock-out events, and lets an operator trigger the backend's existing synchronization workflow.

Inventory is read-only. Vendor REST and CSV feeds are the authoritative stock sources, so the dashboard does not allow operators to edit normalized product records directly.

## Features

- inventory summary for total products, in-stock products, out-of-stock products, and vendors
- responsive product table with SKU, product name, vendor, quantity, and derived stock status
- case-insensitive search by SKU or product name
- vendor and stock-status filters that compose client-side
- recent positive-to-zero stock alerts
- manual synchronization with loading, success, and failure feedback
- automatic product and alert refresh after synchronization
- loading, API error, empty-inventory, and empty-filter states

## Technology and why it is used

| Library or tool | Purpose and rationale |
| --- | --- |
| [Next.js](https://nextjs.org/) | Provides the App Router, application shell, build tooling, and a production-ready React runtime without requiring custom bundler configuration. |
| [React](https://react.dev/) | Implements the dashboard as small declarative components and keeps transient filter state close to the UI that owns it. |
| [TypeScript](https://www.typescriptlang.org/) | Types API contracts, component inputs, and filter values so contract mismatches and invalid states are caught during development. |
| [Redux Toolkit](https://redux-toolkit.js.org/) | Configures the Redux store with the recommended defaults and hosts the RTK Query reducer and middleware. No general-purpose UI slice is needed. |
| [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) | Owns remote API data, caching, request lifecycle state, mutations, and cache invalidation. This avoids duplicating server data in component state or another Redux slice. |
| [React Redux](https://react-redux.js.org/) | Makes the RTK Query-enabled store available through a single client-side provider at the application boundary. |
| [Tailwind CSS](https://tailwindcss.com/) | Keeps the restrained internal-tool styling colocated with components and supports responsive behavior without adding a component library. |
| [ESLint](https://eslint.org/) with `eslint-config-next` | Applies Next.js, React, accessibility, and general code-quality checks. |

The project intentionally does not include a charting package, component framework, form library, or standalone state-management abstraction. The current interface does not need them.

## Running locally

Start the Spring Boot backend first by following the [root project README](../README.md). The backend should be available at `http://localhost:8080`.

Create `frontend/.env.local` with:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Then start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Available commands

```bash
npm run dev        # start the development server
npm run lint       # run ESLint
npm run typecheck  # generate Next.js route types and check TypeScript
npm run build      # create a production build
npm run start      # serve a completed production build
```

No frontend test runner is currently configured. The filtering logic is kept as a small pure function so focused unit tests can be added easily if the feature grows.

## Architecture and state boundaries

### Remote state belongs to RTK Query

The API layer in `src/lib/services/api.ts` defines the backend contracts and exposes generated hooks for:

- `GET /products`
- `GET /stock-events`
- `POST /sync`

Components consume the generated query and mutation hooks directly. They use RTK Query's `isLoading`, `isFetching`, `isError`, and mutation status values rather than recreating request state locally.

The product and stock-event queries provide cache tags. A successful synchronization mutation invalidates both tags, which causes active queries to refetch automatically. This keeps the displayed inventory consistent without manually copying responses or coordinating imperative refresh calls.

### Transient UI state stays local

Search text, selected vendor, and selected stock status live in the inventory dashboard component because they are temporary presentation concerns. They are not shared across routes, persisted, or required by unrelated features, so putting them in Redux would add indirection without providing value.

Summary values and vendor options are derived from the product response. Filtered products are computed from the response and local filter state. None of these derived values are stored as another source of truth.

### Server and client component boundary

The App Router layout and page provide the application shell. `src/app/providers.tsx` is the narrow client boundary that creates one Redux store per mounted application and supplies it through React Redux. Interactive inventory components opt into client rendering only where hooks and local state require it.

### Feature-oriented components

Inventory behavior is grouped in `src/features/inventory`:

- `inventory-dashboard.tsx` owns product presentation, summaries, and local filters
- `inventory-filters.ts` contains the pure filtering rules
- `recent-stock-alerts.tsx` owns the secondary stock-event view
- `sync-now-control.tsx` owns the synchronization mutation and operator feedback

This separation keeps responsibilities visible while avoiding layers or abstractions that would only add architectural appearance to a small exercise.

## API contracts

The frontend currently expects products shaped as:

```ts
interface Product {
  id: number;
  sku: string;
  name: string;
  stockQuantity: number;
  vendor: string;
  updatedAt: string;
}
```

Stock events are expected as:

```ts
interface StockEvent {
  id: number;
  sku: string;
  productName: string;
  vendor: string;
  currentQuantity: number;
  eventTime: string;
}
```

Stock status is derived in the UI: a quantity greater than zero is **In Stock**, while zero is **Out of Stock**.

## UI practices

- layouts use mobile-first responsive spacing and allow the inventory table to scroll horizontally on narrow screens
- semantic headings, definition lists, table headers, captions, and live regions improve screen-reader navigation
- interactive elements include visible focus states and communicate disabled or busy states
- loading placeholders preserve the approximate page layout while data is requested
- API errors provide retry actions, while true empty data and empty filtered results use distinct messages
- status badges combine text and color so meaning does not rely on color alone

## Project structure

```text
frontend/
├── src/app/                    # App Router layout, page, provider, and global styles
├── src/features/inventory/     # Dashboard, filters, alerts, and synchronization UI
├── src/lib/services/api.ts     # Typed RTK Query API and cache-tag behavior
└── src/lib/store.ts            # Redux Toolkit store configuration
```

## Scope and trade-offs

- Filtering is client-side because this exercise uses a deliberately small inventory dataset. A larger production catalog would use backend pagination, search, and filtering.
- Authentication and authorization are outside the exercise scope.
- Manual synchronization is intentionally a simple operator action. A production system would likely add authorization, audit history, concurrency controls, and more detailed per-vendor results.
- The frontend trusts the backend's normalized response contracts. Runtime schema validation could be introduced if it needed to consume less controlled or independently versioned APIs.
