export function kvNamespace(prefix = process.env.KV_PREFIX): string {
  return (prefix ?? "").trim().replace(/:+$/, "");
}

export function withKvPrefix(key: string, prefix = process.env.KV_PREFIX): string {
  const ns = kvNamespace(prefix);
  return ns ? `${ns}:${key}` : key;
}

export function disponibleKey(
  agenteId: string,
  prefix = process.env.KV_PREFIX
): string {
  return withKvPrefix(`agente:${agenteId}:disponible`, prefix);
}

export function ultimoAsignadoKey(prefix = process.env.KV_PREFIX): string {
  return withKvPrefix("rotacion:ultimo_asignado", prefix);
}

export function asignacionesKey(
  agenteId: string,
  fecha: string,
  prefix = process.env.KV_PREFIX
): string {
  return withKvPrefix(`asignaciones:${agenteId}:${fecha}`, prefix);
}
