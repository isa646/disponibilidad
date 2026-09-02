export type Agente = {
  id: string;
  nombre: string;
  email: string;
};

function isAgente(value: unknown): value is Agente {
  if (typeof value !== "object" || value === null) return false;
  const agente = value as Record<string, unknown>;
  return (
    typeof agente.id === "string" &&
    agente.id.trim().length > 0 &&
    typeof agente.nombre === "string" &&
    agente.nombre.trim().length > 0 &&
    typeof agente.email === "string" &&
    agente.email.trim().length > 0
  );
}

function parseAgentes(): Agente[] {
  const raw = process.env.AGENTES_JSON?.trim();
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.error("[agentes] AGENTES_JSON debe ser un array JSON");
      return [];
    }

    const agentes = parsed.filter(isAgente);
    if (agentes.length !== parsed.length) {
      console.error(
        "[agentes] AGENTES_JSON tiene entradas inválidas; se requieren id, nombre y email"
      );
    }
    return agentes;
  } catch {
    console.error("[agentes] AGENTES_JSON no es JSON válido");
    return [];
  }
}

export const AGENTES: Agente[] = parseAgentes();

export function isAgenteId(id: string): boolean {
  return AGENTES.some((agente) => agente.id === id);
}

export function getAgenteById(id: string) {
  return AGENTES.find((agente) => agente.id === id);
}

export function getAgenteByEmail(email: string) {
  return AGENTES.find(
    (agente) => agente.email.toLowerCase() === email.toLowerCase()
  );
}
