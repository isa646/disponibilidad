const GHL_API_BASE = "https://services.leadconnectorhq.com";
const GHL_API_VERSION = "2021-07-28";
const GHL_FETCH_TIMEOUT_MS = 8_000;

export type CustomFieldIds = {
  asignadoA: string;
  asignadoEl: string;
  asignadoALas: string;
};

export function getCustomFieldIds(): CustomFieldIds {
  return {
    asignadoA: process.env.GHL_FIELD_ASIGNADO_A?.trim() ?? "",
    asignadoEl: process.env.GHL_FIELD_ASIGNADO_EL?.trim() ?? "",
    asignadoALas: process.env.GHL_FIELD_ASIGNADO_A_LAS?.trim() ?? "",
  };
}

export function customFieldsConfigurados(ids = getCustomFieldIds()): boolean {
  return Object.values(ids).every((id) => id.length > 0);
}

export interface GhlContact {
  id?: string;
  assignedTo?: string | null;
  locationId?: string;
  tags?: string[];
}

export interface GhlGetContactResponse {
  contact?: GhlContact;
}

export interface GhlUser {
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Formato de escritura por defecto según la doc oficial de GHL (PUT /contacts/{id}).
 * Si tu cuenta usa otro shape ({ id, value } o { key, field_value }), ajusta solo esta función.
 */
export type GhlCustomFieldWriteItem =
  | { id: string; field_value: string }
  | { id: string; value: string }
  | { key: string; field_value: string };

export interface GhlUpdateContactCustomFieldsBody {
  customFields: GhlCustomFieldWriteItem[];
}

export class GhlApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly responseBody: string
  ) {
    super(message);
    this.name = "GhlApiError";
  }
}

export function getGhlHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Version: GHL_API_VERSION,
    Accept: "application/json",
  };
}

export function getGhlToken(): string | undefined {
  return process.env.GHL_PRIVATE_TOKEN;
}

export function getAgentDisplayName(user: GhlUser): string {
  if (user.name?.trim()) {
    return user.name.trim();
  }

  const parts = [user.firstName, user.lastName]
    .map((part) => part?.trim())
    .filter(Boolean);

  if (parts.length > 0) {
    return parts.join(" ");
  }

  return user.id ?? "Agente sin nombre";
}

export function getCostaRicaTimestamp(now = new Date()): {
  fecha: string;
  hora: string;
} {
  const timeZone = "America/Costa_Rica";

  const fecha = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const hora = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);

  return { fecha, hora };
}

export function buildCustomFieldsPayload(
  fieldIds: {
    asignadoA: string;
    asignadoEl: string;
    asignadoALas: string;
  },
  values: {
    asignadoA: string;
    asignadoEl: string;
    asignadoALas: string;
  }
): GhlUpdateContactCustomFieldsBody {
  return {
    customFields: [
      { id: fieldIds.asignadoA, field_value: values.asignadoA },
      { id: fieldIds.asignadoEl, field_value: values.asignadoEl },
      { id: fieldIds.asignadoALas, field_value: values.asignadoALas },
    ],
  };
}

async function fetchGhl(
  url: string,
  token: string,
  init: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GHL_FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        ...getGhlHeaders(token),
        ...(init.headers ?? {}),
      },
      cache: 'no-store', // No cache para evitar respuestas obsoletas.
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function parseGhlResponse<T>(response: Response, context: string): Promise<T> {
  const body = await response.text().catch(() => "");

  if (!response.ok) {
    throw new GhlApiError(
      `GHL ${context} respondió ${response.status}`,
      response.status,
      body
    );
  }

  if (!body) {
    return {} as T;
  }

  return JSON.parse(body) as T;
}

export async function getContact(
  contactId: string,
  token: string
): Promise<GhlGetContactResponse> {
  const response = await fetchGhl(
    `${GHL_API_BASE}/contacts/${encodeURIComponent(contactId)}`,
    token
  );

  return parseGhlResponse<GhlGetContactResponse>(response, "GET /contacts/{id}");
}

export async function getUser(userId: string, token: string): Promise<GhlUser> {
  const response = await fetchGhl(
    `${GHL_API_BASE}/users/${encodeURIComponent(userId)}`,
    token
  );

  return parseGhlResponse<GhlUser>(response, "GET /users/{id}");
}

export async function updateContactCustomFields(
  contactId: string,
  token: string,
  payload: GhlUpdateContactCustomFieldsBody
): Promise<void> {
  const response = await fetchGhl(
    `${GHL_API_BASE}/contacts/${encodeURIComponent(contactId)}`,
    token,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  await parseGhlResponse<unknown>(response, "PUT /contacts/{id}");
}
