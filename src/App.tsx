const STARTING_CASH = 1500

function formatGBP(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function App() {
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col px-5 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Monopoly Helper</h1>
        <p className="mt-1 text-sm text-slate-400">Keep tabs on your worth, turn by turn.</p>
      </header>

      <section className="rounded-2xl bg-slate-800/70 p-6 shadow-lg ring-1 ring-slate-700/60">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Net worth</p>
        <p className="mt-1 text-4xl font-bold text-emerald-400">{formatGBP(STARTING_CASH)}</p>
        <p className="mt-2 text-sm text-slate-400">
          Cash {formatGBP(STARTING_CASH)} · Property {formatGBP(0)}
        </p>
      </section>

      <div className="mt-auto pt-10 text-center text-xs text-slate-500">
        Phase 1 stub · Standard UK edition
      </div>
    </main>
  )
}
