import { NextResponse } from "next/server";
import { isAgenteId } from "@/lib/agentes";
import { setDisponibilidad } from "@/lib/kv";

export const dynamic = "force-dynamic";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

export async function POST(request: Request) {
  let body: { agenteId?: string; disponible?: boolean };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
  }

  const { agenteId, disponible } = body;

  if (!agenteId || typeof agenteId !== "string" || !isAgenteId(agenteId)) {
    return NextResponse.json({ error: "agenteId inválido" }, { status: 400 });
  }

  if (typeof disponible !== "boolean") {
    return NextResponse.json(
      { error: "disponible debe ser un booleano" },
      { status: 400 }
    );
  }

  await setDisponibilidad(agenteId, disponible);

  return NextResponse.json(
    { ok: true, disponible },
    { headers: NO_CACHE_HEADERS }
  );
}
