"use client";

import { useMemo, useState } from "react";

import {
  type Product,
  useGetProductsQuery,
} from "@/lib/services/api";
import {
  filterProducts,
  type StockStatusFilter,
} from "./inventory-filters";
import { RecentStockAlerts } from "./recent-stock-alerts";

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
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className={`mt-2 text-2xl font-semibold tracking-tight sm:text-3xl ${valueClassName}`}>
        {value}
      </dd>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div aria-busy="true" className="space-y-6" role="status">
      <span className="sr-only">Loading inventory…</span>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white shadow-sm sm:h-28"
            key={index}
          />
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="h-16 animate-pulse border-b border-slate-200 bg-slate-50" />
        <div className="space-y-4 p-4 sm:p-6">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="h-5 animate-pulse rounded bg-slate-100" key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

type InventoryTableProps = {
  products: Product[];
  filteredProducts: Product[];
  search: string;
  vendor: string;
  stockStatus: StockStatusFilter;
  vendors: string[];
  onSearchChange: (value: string) => void;
  onVendorChange: (value: string) => void;
  onStockStatusChange: (value: StockStatusFilter) => void;
  onClearFilters: () => void;
};

function InventoryTable({
  products,
  filteredProducts,
  search,
  vendor,
  stockStatus,
  vendors,
  onSearchChange,
  onVendorChange,
  onStockStatusChange,
  onClearFilters,
}: InventoryTableProps) {
  const hasActiveFilters = Boolean(search || vendor || stockStatus !== "all");

  return (
    <section
      aria-labelledby="inventory-heading"
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-200 px-4 py-5 sm:px-6">
        <h2 className="text-base font-semibold text-slate-900" id="inventory-heading">
          Inventory
        </h2>
        <p className="mt-1 text-sm text-slate-500" id="inventory-description">
          Current normalized stock across all connected vendors.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_14rem_12rem_auto] lg:items-end">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Search</span>
            <input
              className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search SKU or product name"
              type="search"
              value={search}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Vendor</span>
            <select
              className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              onChange={(event) => onVendorChange(event.target.value)}
              value={vendor}
            >
              <option value="">All Vendors</option>
              {vendors.map((vendorOption) => (
                <option key={vendorOption} value={vendorOption}>
                  {vendorOption}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Stock status</span>
            <select
              className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              onChange={(event) =>
                onStockStatusChange(event.target.value as StockStatusFilter)
              }
              value={stockStatus}
            >
              <option value="all">All</option>
              <option value="in-stock">In Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </label>

          <button
            className="justify-self-start rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent lg:justify-self-end"
            disabled={!hasActiveFilters}
            onClick={onClearFilters}
            type="button"
          >
            Clear filters
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-500" aria-live="polite" id="inventory-results">
          Showing {filteredProducts.length} of {products.length} products
        </p>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="px-4 py-14 text-center sm:px-6" role="status">
          <h3 className="text-sm font-semibold text-slate-900">
            No products match these filters
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Try a different search term or clear one of the selected filters.
          </p>
          <button
            className="mt-4 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            onClick={onClearFilters}
            type="button"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div
          aria-label="Scrollable inventory table"
          className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600"
          role="region"
          tabIndex={0}
        >
          <table
            aria-describedby="inventory-description inventory-results"
            className="min-w-full divide-y divide-slate-200 text-left text-sm"
          >
            <caption className="sr-only">
              Product inventory. {filteredProducts.length} of {products.length} products shown.
            </caption>
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 sm:px-6" scope="col">SKU</th>
                <th className="px-4 py-3 sm:px-6" scope="col">Product name</th>
                <th className="px-4 py-3 sm:px-6" scope="col">Vendor</th>
                <th className="px-4 py-3 text-right sm:px-6" scope="col">Stock quantity</th>
                <th className="px-4 py-3 sm:px-6" scope="col">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => {
                const isInStock = product.stockQuantity > 0;

                return (
                  <tr className="text-slate-700 transition-colors hover:bg-slate-50" key={product.id}>
                    <th className="whitespace-nowrap px-4 py-3.5 text-left font-mono text-xs font-medium text-slate-900 sm:px-6" scope="row">
                      {product.sku}
                    </th>
                    <td className="min-w-56 px-4 py-3.5 font-medium text-slate-900 sm:px-6">
                      {product.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 sm:px-6">{product.vendor}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right font-medium tabular-nums sm:px-6">
                      {product.stockQuantity}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                      <span
                        className={
                          isInStock
                            ? "inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                            : "inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20"
                        }
                      >
                        <span
                          aria-hidden="true"
                          className={`size-1.5 rounded-full ${isInStock ? "bg-emerald-500" : "bg-rose-500"}`}
                        />
                        {isInStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function InventoryDashboard() {
  const { data: products, isLoading, isFetching, isError, refetch } =
    useGetProductsQuery();
  const [search, setSearch] = useState("");
  const [vendor, setVendor] = useState("");
  const [stockStatus, setStockStatus] = useState<StockStatusFilter>("all");

  const vendorOptions = useMemo(
    () =>
      Array.from(new Set((products ?? []).map((product) => product.vendor))).sort(),
    [products],
  );
  const filteredProducts = useMemo(
    () =>
      filterProducts(products ?? [], {
        search,
        vendor,
        stockStatus,
      }),
    [products, search, vendor, stockStatus],
  );

  function clearFilters() {
    setSearch("");
    setVendor("");
    setStockStatus("all");
  }

  if (isLoading) {
    return <DashboardLoading />;
  }

  if (isError) {
    return (
      <div
        className="rounded-xl border border-rose-200 bg-white px-4 py-10 text-center shadow-sm sm:px-6"
        role="alert"
      >
        <h2 className="text-base font-semibold text-slate-900">
          Inventory could not be loaded
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Confirm that the Stock Sync backend is running, then try again.
        </p>
        <button
          className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-wait disabled:bg-slate-500"
          disabled={isFetching}
          onClick={() => refetch()}
          type="button"
        >
          {isFetching ? "Retrying…" : "Retry"}
        </button>
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div
        className="rounded-xl border border-slate-200 bg-white px-4 py-14 text-center shadow-sm sm:px-6"
        role="status"
      >
        <h2 className="text-base font-semibold text-slate-900">No inventory yet</h2>
        <p className="mt-2 text-sm text-slate-600">
          Products will appear here after the first vendor synchronization completes.
        </p>
      </div>
    );
  }

  const inStock = products.filter((product) => product.stockQuantity > 0).length;
  const outOfStock = products.filter((product) => product.stockQuantity === 0).length;
  const vendorCount = new Set(products.map((product) => product.vendor)).size;

  return (
    <div className="space-y-6">
      <dl aria-label="Inventory summary" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <SummaryCard label="Total Products" value={products.length} />
        <SummaryCard label="In Stock" value={inStock} valueClassName="text-emerald-700" />
        <SummaryCard label="Out of Stock" value={outOfStock} valueClassName="text-rose-700" />
        <SummaryCard label="Vendors" value={vendorCount} />
      </dl>

      <InventoryTable
        filteredProducts={filteredProducts}
        onClearFilters={clearFilters}
        onSearchChange={setSearch}
        onStockStatusChange={setStockStatus}
        onVendorChange={setVendor}
        products={products}
        search={search}
        stockStatus={stockStatus}
        vendor={vendor}
        vendors={vendorOptions}
      />

      <RecentStockAlerts />
    </div>
  );
}
