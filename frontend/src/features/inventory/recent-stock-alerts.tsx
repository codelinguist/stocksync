"use client";

import { useGetStockEventsQuery } from "@/lib/services/api";

function formatRelativeTime(timestamp: string) {
  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000),
  );

  if (elapsedSeconds < 60) {
    return "Just now";
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} minute${elapsedMinutes === 1 ? "" : "s"} ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return `${elapsedHours} hour${elapsedHours === 1 ? "" : "s"} ago`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  return `${elapsedDays} day${elapsedDays === 1 ? "" : "s"} ago`;
}

export function RecentStockAlerts() {
  const {
    data: stockEvents,
    isLoading,
    isError,
    refetch,
  } = useGetStockEventsQuery();

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-sm font-semibold text-slate-900">
          Recent Stock Alerts
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Latest products that transitioned to zero stock.
        </p>
      </div>

      {isLoading ? (
        <div
          aria-busy="true"
          aria-label="Loading recent stock alerts"
          className="divide-y divide-slate-100"
        >
          {Array.from({ length: 3 }, (_, index) => (
            <div className="space-y-2 px-6 py-4" key={index}>
              <div className="h-4 w-48 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-64 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5" role="alert">
          <p className="text-sm text-slate-600">Stock alerts could not be loaded.</p>
          <button
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            onClick={() => refetch()}
            type="button"
          >
            Retry
          </button>
        </div>
      ) : !stockEvents?.length ? (
        <p className="px-6 py-6 text-sm text-slate-500">
          No recent stock alerts
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {stockEvents.slice(0, 5).map((stockEvent) => (
            <li className="flex gap-3 px-6 py-4" key={stockEvent.id}>
              <span
                aria-hidden="true"
                className="mt-1.5 size-2 shrink-0 rounded-full bg-rose-500"
              />
              <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between sm:gap-6">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {stockEvent.productName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {stockEvent.vendor} · {stockEvent.sku}
                  </p>
                </div>
                <div className="mt-2 flex shrink-0 items-center gap-3 text-xs sm:mt-0">
                  <span className="font-medium text-rose-700">Out of stock</span>
                  <time
                    className="text-slate-500"
                    dateTime={stockEvent.eventTime}
                    title={new Date(stockEvent.eventTime).toLocaleString()}
                  >
                    {formatRelativeTime(stockEvent.eventTime)}
                  </time>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
