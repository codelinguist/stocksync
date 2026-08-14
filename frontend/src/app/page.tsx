import { InventoryDashboard } from "@/features/inventory/inventory-dashboard";
import { SyncNowControl } from "@/features/inventory/sync-now-control";

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div>
            <p className="text-lg font-semibold tracking-tight text-slate-900">
              Stock Operations
            </p>
            <p className="text-xs text-slate-500">Inventory workspace</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Operations
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-700">Inventory dashboard</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Inventory overview
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Review product availability and current stock levels by vendor.
            </p>
          </div>

          <SyncNowControl />
        </div>

        <InventoryDashboard />
      </main>
    </div>
  );
}
