import { cookies } from "next/headers";
import { getAgenteById } from "@/lib/agentes";
import { canAccessAdmin } from "@/lib/admin-auth";
import {
  esHoyCostaRica,
  resolverFechaConsulta,
} from "@/lib/fecha-costa-rica";
import {
  getAsignacionesDelDiaTodos,
  getEstadoTodos,
  getUltimoAsignado,
} from "@/lib/kv";
import AdminAgentList from "./AdminAgentList";
import AdminDateNav from "./AdminDateNav";
import AdminLogin from "./AdminLogin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  searchParams: { email?: string; fecha?: string };
};

export default async function AdminPage({ searchParams }: Props) {
  const cookieStore = cookies();
  const session = cookieStore.get("admin_session")?.value;
  const email = searchParams.email
    ? decodeURIComponent(searchParams.email)
    : undefined;

  if (!canAccessAdmin(session, email)) {
    return <AdminLogin />;
  }

  const fechaConsulta = resolverFechaConsulta(searchParams.fecha);
  const esHoy = esHoyCostaRica(fechaConsulta);

  const [agentes, ultimoAsignadoId, asignacionesDelDia] = await Promise.all([
    getEstadoTodos(),
    getUltimoAsignado(),
    getAsignacionesDelDiaTodos(fechaConsulta),
  ]);

  const totalAsignaciones = Object.values(asignacionesDelDia).reduce(
    (suma, total) => suma + total,
    0
  );

  const ultimoAsignado = ultimoAsignadoId
    ? getAgenteById(ultimoAsignadoId)
    : null;

  return (
    <div className="min-h-screen bg-background px-4 py-4">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-3 text-xl font-semibold text-gray-900">
          Panel de supervisor
        </h1>

        <AdminDateNav
          fecha={fechaConsulta}
          puedeAvanzar={!esHoy}
          total={totalAsignaciones}
          email={email}
        />

        <div className="mb-4 rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Último agente asignado</p>
          <p className="text-base font-medium text-gray-900">
            {ultimoAsignado
              ? ultimoAsignado.nombre
              : "Ninguno (arranque en frío)"}
          </p>
        </div>

        <AdminAgentList
          agentesIniciales={agentes.map((agente) => ({
            ...agente,
            asignaciones: asignacionesDelDia[agente.id] ?? 0,
          }))}
          etiquetaAsignaciones={
            esHoy ? "Asignaciones hoy" : "Asignaciones ese día"
          }
        />
      </div>
    </div>
  );
}
