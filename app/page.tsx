import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <main className="w-full max-w-sm rounded-xl bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-xl font-semibold text-gray-900">
          Disponibilidad de agentes
        </h1>
        <p className="mb-6 text-sm text-gray-600">
          Marque su disponibilidad o abra el panel de supervisor.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/toggle"
            className="rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
          >
            Toggle de agente
          </Link>
          <Link
            href="/admin"
            className="rounded-lg border border-gray-200 px-4 py-2 text-center text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Panel de supervisor
          </Link>
        </div>
      </main>
    </div>
  );
}
