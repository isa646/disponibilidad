"use client";

import { useCallback, useEffect, useState } from "react";

type AgenteEstado = {
  id: string;
  nombre: string;
  disponible: boolean;
};

type Props = {
  agenteId: string;
  agenteNombre: string;
  disponibleInicial: boolean;
};

const POLL_INTERVAL_MS = 18_000;

export default function ToggleClient({
  agenteId,
  agenteNombre,
  disponibleInicial,
}: Props) {
  const [disponible, setDisponible] = useState(disponibleInicial);
  const [otrosDisponibles, setOtrosDisponibles] = useState<AgenteEstado[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEstado = useCallback(async () => {
    try {
      const res = await fetch("/api/estado", { cache: "no-store" });
      if (!res.ok) return;
      const data: { agentes: AgenteEstado[] } = await res.json();

      const agenteActual = data.agentes.find((a) => a.id === agenteId);
      if (agenteActual) {
        setDisponible(agenteActual.disponible);
      }

      setOtrosDisponibles(
        data.agentes.filter((a) => a.disponible && a.id !== agenteId)
      );
    } catch {
      // Silencioso: la lista es informativa
    }
  }, [agenteId]);

  useEffect(() => {
    fetchEstado();
    const interval = setInterval(fetchEstado, POLL_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchEstado();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [fetchEstado]);

  async function handleToggle() {
    const nuevoEstado = !disponible;
    setCargando(true);
    setError(null);

    try {
      const res = await fetch("/api/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agenteId, disponible: nuevoEstado }),
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("No se pudo actualizar el estado");
      }

      setDisponible(nuevoEstado);
      await fetchEstado();
    } catch {
      setError("Error al actualizar. Intente de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-2xl font-semibold text-gray-900">
          Hola, {agenteNombre}
        </h1>

        <button
          type="button"
          onClick={handleToggle}
          disabled={cargando}
          className={`w-full rounded-2xl px-6 py-8 text-xl font-bold transition-colors disabled:opacity-60 ${
            disponible
              ? "bg-green-500 text-white shadow-lg shadow-green-200 hover:bg-green-600"
              : "bg-gray-300 text-gray-700 hover:bg-gray-400"
          }`}
        >
          {cargando
            ? "Actualizando..."
            : disponible
              ? "Disponible"
              : "No disponible"}
        </button>

        {error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}

        <div className="mt-10">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
            Otros agentes disponibles
          </h2>
          {otrosDisponibles.length === 0 ? (
            <p className="text-center text-sm text-gray-400">
              Ningún otro agente disponible en este momento
            </p>
          ) : (
            <ul className="space-y-2">
              {otrosDisponibles.map((agente) => (
                <li
                  key={agente.id}
                  className="rounded-lg bg-white px-4 py-3 text-sm text-gray-700 shadow-sm"
                >
                  {agente.nombre}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
