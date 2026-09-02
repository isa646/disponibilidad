import { NextResponse } from "next/server";
import { AGENTES, getAgenteById } from "@/lib/agentes";
import {
  getEstadoTodos,
  getUltimoAsignado,
  setUltimoAsignado,
  incrementarAsignacionDelDia,
} from "@/lib/kv";
import { elegirSiguienteAgente } from "@/lib/rotacion";

export const dynamic = 'force-dynamic';

function verificarApiKey(request: Request): boolean {
  const apiKey = request.headers.get("x-api-key");
  const expected = process.env.GHL_API_KEY;
  return Boolean(expected && apiKey === expected);
}

export async function GET(request: Request) {
  if (!verificarApiKey(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const estados = await getEstadoTodos();
  const disponibles = new Set(
    estados.filter((a) => a.disponible).map((a) => a.id)
  );

  if (disponibles.size === 0) {
    return NextResponse.json({ agente: null, disponible: false });
  }

  const ultimoAsignado = await getUltimoAsignado();
  const siguienteId = elegirSiguienteAgente(
    AGENTES,
    disponibles,
    ultimoAsignado
  );

  if (!siguienteId) {
    return NextResponse.json({ agente: null, disponible: false });
  }

  await setUltimoAsignado(siguienteId);
  await incrementarAsignacionDelDia(siguienteId);

  const agente = getAgenteById(siguienteId)!;

  return NextResponse.json({
    agente: agente.id,
    nombre: agente.nombre,
    disponible: true,
  });
}
