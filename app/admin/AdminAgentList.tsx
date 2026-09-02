"use client";

import { useCallback, useEffect, useState } from "react";

type AgenteEstado = {
  id: string;
  nombre: string;
  disponible: boolean;
  asignaciones: number;
};

type Props = {
  agentesIniciales: AgenteEstado[];
  etiquetaAsignaciones: string;
};

const POLL_INTERVAL_MS = 18_000;

export default function AdminAgentList({
  agentesIniciales,
  etiquetaAsignaciones,
}: Props) {
  const [agentes, setAgentes] = useState(agentesIniciales);
  const [cargandoId, setCargandoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchEstado = useCallback(async () => {
    try {
      const res = await fetch("/api/estado", { cache: "no-store" });
      if (!res.ok) return;
      const data: { agentes: { id: string; nombre: string; disponible: boolean }[] } =
        await res.json();

      setAgentes((prev) =>
        prev.map((agente) => {
          const actualizado = data.agentes.find((a) => a.id === agente.id);
          if (!actualizado) return agente;
          return { ...agente, disponible: actualizado.disponible };
        })
      );
    } catch {
      // Silencioso
    }
  }, []);

  useEffect(() => {
    setAgentes(agentesIniciales);
  }, [agentesIniciales]);

  useEffect(() => {
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

  async function handleToggle(agenteId: string, nuevoEstado: boolean) {
    setCargandoId(agenteId);
    setError(null);

    try {
      const res = await fetch("/api/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agenteId, disponible: nuevoEstado }),
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("No se pudo actualizar");
      }

      setAgentes((prev) =>
        prev.map((agente) =>
          agente.id === agenteId
            ? { ...agente, disponible: nuevoEstado }
            : agente
        )
      );
    } catch {
      setError("Error al actualizar la disponibilidad. Intente de nuevo.");
    } finally {
      setCargandoId(null);
    }
  }

  return (
    <>
      {error && (
        <p className="mb-3 text-center text-xs text-red-600">{error}</p>
      )}

      <ul className="space-y-2">
        {agentes.map((agente) => {
          const cargando = cargandoId === agente.id;

          return (
            <li
              key={agente.id}
              className="rounded-xl bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-gray-900">
                  {agente.nombre}
                </span>
                <button
                  type="button"
                  onClick={() => handleToggle(agente.id, !agente.disponible)}
                  disabled={cargando}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-60 ${
                    agente.disponible
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cargando
                    ? "..."
                    : agente.disponible
                      ? "Disponible"
                      : "No disponible"}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                {etiquetaAsignaciones}:{" "}
                <span className="font-medium text-gray-700">
                  {agente.asignaciones}
                </span>
              </p>
            </li>
          );
        })}
      </ul>
    </>
  );
}
