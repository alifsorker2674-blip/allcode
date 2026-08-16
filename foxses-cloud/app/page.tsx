export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 text-slate-900">
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
          Foxses Cloud
        </h1>
        <p className="text-lg text-slate-600">
          Domain Search & Hosting Management Platform
        </p>
        <div className="pt-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Ready for development (Light Theme)
          </div>
        </div>
      </div>
    </main>
  );
}


