export const ZONA_HORARIA_COSTA_RICA = "America/Costa_Rica";

/** Fecha local de Costa Rica en formato YYYY-MM-DD */
export function getFechaHoyCostaRica(fecha = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA_COSTA_RICA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(fecha);
}

/** Etiqueta legible para mostrar en la UI, ej. "8 de julio de 2026" */
export function formatearFechaCostaRica(fecha = new Date()): string {
  return new Intl.DateTimeFormat("es-CR", {
    timeZone: ZONA_HORARIA_COSTA_RICA,
    dateStyle: "long",
  }).format(fecha);
}

export function esFechaValida(fecha: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const [y, m, d] = fecha.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

export function fechaAStringUTC(fechaStr: string): Date {
  const [y, m, d] = fechaStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

export function formatearFechaCostaRicaDesdeString(fechaStr: string): string {
  return formatearFechaCostaRica(fechaAStringUTC(fechaStr));
}

export function sumarDiasFecha(fechaStr: string, dias: number): string {
  const date = fechaAStringUTC(fechaStr);
  date.setUTCDate(date.getUTCDate() + dias);
  return getFechaHoyCostaRica(date);
}

export function resolverFechaConsulta(fechaParam?: string): string {
  const hoy = getFechaHoyCostaRica();
  if (!fechaParam || !esFechaValida(fechaParam) || fechaParam > hoy) {
    return hoy;
  }
  return fechaParam;
}

export function esHoyCostaRica(fechaStr: string): boolean {
  return fechaStr === getFechaHoyCostaRica();
}
