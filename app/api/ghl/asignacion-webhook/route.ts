import { NextResponse } from "next/server";
import {
  buildCustomFieldsPayload,
  customFieldsConfigurados,
  getAgentDisplayName,
  getContact,
  getCostaRicaTimestamp,
  getCustomFieldIds,
  getGhlToken,
  getUser,
  GhlApiError,
  updateContactCustomFields,
} from "@/lib/ghl-asignacion";

export const dynamic = "force-dynamic";

interface AsignacionWebhookBody {
  contactId?: string;
  locationId?: string;
}

function verificarWebhookSecret(request: Request): boolean {
  const secret = request.headers.get("X-GHL-Secret");
  const expected = process.env.GHL_WEBHOOK_SECRET;
  return Boolean(expected && secret === expected);
}

export async function POST(request: Request) {
  if (!verificarWebhookSecret(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: AsignacionWebhookBody;

  try {
    body = (await request.json()) as AsignacionWebhookBody;
  } catch {
    return NextResponse.json(
      { error: "El body debe ser JSON válido" },
      { status: 400 }
    );
  }

  const { contactId } = body;

  if (!contactId) {
    return NextResponse.json(
      { error: "Falta el campo contactId en el body" },
      { status: 400 }
    );
  }

  const token = getGhlToken();

  if (!token) {
    console.error(
      "[asignacion-webhook] GHL_PRIVATE_TOKEN no configurado"
    );
    return NextResponse.json(
      { error: "Error al procesar la asignación" },
      { status: 500 }
    );
  }

  if (!customFieldsConfigurados()) {
    console.error(
      "[asignacion-webhook] Faltan GHL_FIELD_ASIGNADO_A / EL / A_LAS"
    );
    return NextResponse.json(
      { error: "Error al procesar la asignación" },
      { status: 500 }
    );
  }

  try {
    const contactData = await getContact(contactId, token);

    if (process.env.NODE_ENV === "development") {
      console.log(
        "[asignacion-webhook] Respuesta cruda GET contact:",
        JSON.stringify(contactData)
      );
    }

    const assignedTo = contactData.contact?.assignedTo?.trim();

    if (!assignedTo) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const user = await getUser(assignedTo, token);
    const agenteNombre = getAgentDisplayName(user);
    const { fecha, hora } = getCostaRicaTimestamp();
    const timestamp = new Date().toISOString();

    const payload = buildCustomFieldsPayload(getCustomFieldIds(), {
      asignadoA: agenteNombre,
      asignadoEl: fecha,
      asignadoALas: hora,
    });

    await updateContactCustomFields(contactId, token, payload);

    console.log(
      `[asignacion-webhook] contactId=${contactId} userId=${assignedTo} agente="${agenteNombre}" timestamp=${timestamp}`
    );

    return NextResponse.json({
      ok: true,
      contactId,
      userId: assignedTo,
      agente: agenteNombre,
      asignadoEl: fecha,
      asignadoALas: hora,
    });
  } catch (error) {
    if (error instanceof GhlApiError) {
      console.error("[asignacion-webhook] Error GHL:", {
        status: error.status,
        body: error.responseBody,
      });
      return NextResponse.json(
        { error: "Error al comunicarse con GoHighLevel" },
        { status: 502 }
      );
    }

    if (error instanceof Error && error.name === "AbortError") {
      console.error("[asignacion-webhook] Timeout consultando GHL");
      return NextResponse.json(
        { error: "Error al comunicarse con GoHighLevel" },
        { status: 502 }
      );
    }

    console.error("[asignacion-webhook] Error inesperado:", error);
    return NextResponse.json(
      { error: "Error interno al procesar la asignación" },
      { status: 500 }
    );
  }
}
