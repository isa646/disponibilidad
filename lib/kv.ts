import { unstable_noStore as noStore } from "next/cache";
import { kv } from "@vercel/kv";
import { AGENTES } from "./agentes";
import { getFechaHoyCostaRica } from "./fecha-costa-rica";

const DISPONIBLE_PREFIX = "agente:";
const DISPONIBLE_SUFFIX = ":disponible";
const ULTIMO_ASIGNADO_KEY = "rotacion:ultimo_asignado";
const ASIGNACIONES_PREFIX = "asignaciones:";
const ASIGNACIONES_TTL_SEGUNDOS = 60 * 60 * 24 * 90;

function disponibleKey(agenteId: string): string {
  return `${DISPONIBLE_PREFIX}${agenteId}${DISPONIBLE_SUFFIX}`;
}

function asignacionesKey(agenteId: string, fecha: string): string {
  return `${ASIGNACIONES_PREFIX}${agenteId}:${fecha}`;
}

export async function getDisponibilidad(agenteId: string): Promise<boolean> {
  noStore();
  const value = await kv.get<string | boolean>(disponibleKey(agenteId));
  return value === "true" || value === true;
}

export async function setDisponibilidad(
  agenteId: string,
  disponible: boolean
): Promise<void> {
  await kv.set(disponibleKey(agenteId), disponible ? "true" : "false");
}

export async function getEstadoTodos(): Promise<
  { id: string; nombre: string; disponible: boolean }[]
> {
  noStore();
  const estados = await Promise.all(
    AGENTES.map(async (agente) => ({
      id: agente.id,
      nombre: agente.nombre,
      disponible: await getDisponibilidad(agente.id),
    }))
  );
  return estados;
}

export async function getUltimoAsignado(): Promise<string | null> {
  const value = await kv.get<string>(ULTIMO_ASIGNADO_KEY);
  return value ?? null;
}

export async function setUltimoAsignado(agenteId: string): Promise<void> {
  await kv.set(ULTIMO_ASIGNADO_KEY, agenteId);
}

export async function getAsignacionesDelDia(
  agenteId: string,
  fecha = getFechaHoyCostaRica()
): Promise<number> {
  const value = await kv.get<number>(asignacionesKey(agenteId, fecha));
  return value ?? 0;
}

export async function incrementarAsignacionDelDia(
  agenteId: string,
  fecha = getFechaHoyCostaRica()
): Promise<number> {
  const key = asignacionesKey(agenteId, fecha);
  const total = await kv.incr(key);

  if (total === 1) {
    await kv.expire(key, ASIGNACIONES_TTL_SEGUNDOS);
  }

  return total;
}

export async function getAsignacionesDelDiaTodos(
  fecha = getFechaHoyCostaRica()
): Promise<Record<string, number>> {
  const conteos = await Promise.all(
    AGENTES.map(async (agente) => [
      agente.id,
      await getAsignacionesDelDia(agente.id, fecha),
    ] as const)
  );

  return Object.fromEntries(conteos);
}
