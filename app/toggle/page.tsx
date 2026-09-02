import { redirect } from "next/navigation";
import { getAgenteById, getAgenteByEmail, isAgenteId } from "@/lib/agentes";
import { isAdministradorEmail } from "@/lib/administradores";
import { getDisponibilidad } from "@/lib/kv";
import ToggleClient from "./ToggleClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  searchParams: { agente?: string; email?: string };
};

export default async function TogglePage({ searchParams }: Props) {
  const { agente: agenteParam, email: emailParam } = searchParams;
  const email = emailParam ? decodeURIComponent(emailParam) : undefined;

  if (isAdministradorEmail(email)) {
    redirect(`/admin?email=${encodeURIComponent(email!)}`);
  }

  let agente = null;

  if (agenteParam && isAgenteId(agenteParam)) {
    agente = getAgenteById(agenteParam);
  } else if (email) {
    agente = getAgenteByEmail(decodeURIComponent(email));
  }

  if (!agente) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="text-center text-lg font-medium text-red-600">
          Agente no reconocido
        </p>
      </div>
    );
  }

  const disponibleInicial = await getDisponibilidad(agente.id);

  return (
    <ToggleClient
      agenteId={agente.id}
      agenteNombre={agente.nombre}
      disponibleInicial={disponibleInicial}
    />
  );
}