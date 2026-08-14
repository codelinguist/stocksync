"use client";

import {
  type Product,
  useGetProductsQuery,
} from "@/lib/services/api";

type SummaryCardProps = {
  label: string;
  value: number;
  valueClassName?: string;
};

function SummaryCard({
  label,
  value,
  valueClassName = "text-slate-900",
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-semibold tracking-tight ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div aria-busy="true" aria-label="Loading inventory" className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white shadow-sm"
            key={index}
          />
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="h-16 animate-pulse border-b border-slate-200 bg-slate-50" />
        <div className="space-y-4 p-6">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="h-5 animate-pulse rounded bg-slate-100" key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

function InventoryTable({ products }: { products: Product[] }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-base font-semibold text-slate-900">Inventory</h2>
        <p className="mt-1 text-sm text-slate-500">
          Current normalized stock across all connected vendors.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-3" scope="col">SKU</th>
              <th className="px-6 py-3" scope="col">Product name</th>
              <th className="px-6 py-3" scope="col">Vendor</th>
              <th className="px-6 py-3 text-right" scope="col">Stock quantity</th>
              <th className="px-6 py-3" scope="col">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => {
              const isInStock = product.stockQuantity > 0;

              return (
                <tr className="text-slate-700" key={product.id}>
                  <td className="whitespace-nowrap px-6 py-4 font-mono text-xs font-medium text-slate-900">
                    {product.sku}
                  </td>
                  <td className="min-w-56 px-6 py-4 font-medium text-slate-900">
                    {product.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">{product.vendor}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-right font-medium tabular-nums">
                    {product.stockQuantity}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={
                        isInStock
                          ? "inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                          : "inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20"
                      }
                    >
                      {isInStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function InventoryDashboard() {
  const { data: products, isLoading, isError, refetch } = useGetProductsQuery();

  if (isLoading) {
    return <DashboardLoading />;
  }

  if (isError) {
    return (
      <div
        className="rounded-xl border border-rose-200 bg-white px-6 py-10 text-center shadow-sm"
        role="alert"
      >
        <h2 className="text-base font-semibold text-slate-900">
          Inventory could not be loaded
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Confirm that the Stock Sync backend is running, then try again.
        </p>
        <button
          className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          onClick={() => refetch()}
          type="button"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">No inventory yet</h2>
        <p className="mt-2 text-sm text-slate-600">
          Products will appear here after the first vendor synchronization completes.
        </p>
      </div>
    );
  }

  const inStock = products.filter((product) => product.stockQuantity > 0).length;
  const outOfStock = products.filter((product) => product.stockQuantity === 0).length;
  const vendors = new Set(products.map((product) => product.vendor)).size;

  return (
    <div className="space-y-6">
      <section aria-label="Inventory summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Products" value={products.length} />
        <SummaryCard label="In Stock" value={inStock} valueClassName="text-emerald-700" />
        <SummaryCard label="Out of Stock" value={outOfStock} valueClassName="text-rose-700" />
        <SummaryCard label="Vendors" value={vendors} />
      </section>

      <InventoryTable products={products} />
    </div>
  );
}
