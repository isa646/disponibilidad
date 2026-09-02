export type Administrador = {
  email: string;
  nombre: string;
};

function isAdministrador(value: unknown): value is Administrador {
  if (typeof value !== "object" || value === null) return false;
  const admin = value as Record<string, unknown>;
  return (
    typeof admin.email === "string" &&
    admin.email.trim().length > 0 &&
    typeof admin.nombre === "string" &&
    admin.nombre.trim().length > 0
  );
}

function parseAdministradores(): Administrador[] {
  const raw = process.env.ADMINS_JSON?.trim();
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.error("[administradores] ADMINS_JSON debe ser un array JSON");
      return [];
    }

    const admins = parsed.filter(isAdministrador);
    if (admins.length !== parsed.length) {
      console.error(
        "[administradores] ADMINS_JSON tiene entradas inválidas; se requieren email y nombre"
      );
    }
    return admins;
  } catch {
    console.error("[administradores] ADMINS_JSON no es JSON válido");
    return [];
  }
}

export const ADMINISTRADORES: readonly Administrador[] = parseAdministradores();

export function isAdministradorEmail(email: string | undefined): boolean {
  if (!email) return false;
  const normalized = decodeURIComponent(email).toLowerCase().trim();
  return ADMINISTRADORES.some(
    (admin) => admin.email.toLowerCase() === normalized
  );
}

export function getAdministradorByEmail(email: string): Administrador | null {
  const normalized = decodeURIComponent(email).toLowerCase().trim();
  return (
    ADMINISTRADORES.find(
      (admin) => admin.email.toLowerCase() === normalized
    ) ?? null
  );
}
