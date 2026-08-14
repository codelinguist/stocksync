"use client";

import { useTriggerSyncMutation } from "@/lib/services/api";

export function SyncNowControl() {
  const [triggerSync, { isLoading, isSuccess, isError }] =
    useTriggerSyncMutation();

  return (
    <div className="flex shrink-0 flex-col items-start sm:items-end">
      <button
        aria-busy={isLoading}
        className="min-w-24 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-wait disabled:bg-slate-500"
        disabled={isLoading}
        onClick={() => triggerSync()}
        type="button"
      >
        {isLoading ? "Syncing…" : "Sync Now"}
      </button>

      <div aria-live="polite" className="mt-2 min-h-4 text-xs">
        {isSuccess && !isLoading ? (
          <p className="font-medium text-emerald-700" role="status">
            Synchronization completed.
          </p>
        ) : null}
        {isError && !isLoading ? (
          <p className="max-w-xs text-rose-700" role="alert">
            Synchronization failed. Confirm the backend is available and try again.
          </p>
        ) : null}
      </div>
    </div>
  );
}
