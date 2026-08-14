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
        <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-blue-700">Inventory dashboard</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            Stock overview coming next
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            The application foundation is ready. Product inventory and vendor
            synchronization status will be added in a later iteration.
          </p>
        </section>
      </main>
    </div>
  );
}
