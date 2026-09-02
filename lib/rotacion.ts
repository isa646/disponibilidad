/**
 * Elige el siguiente agente disponible usando round-robin circular.
 *
 * @param agentes - Lista fija de agentes en orden de rotación
 * @param disponibles - Set de ids de agentes marcados como disponibles
 * @param ultimoAsignadoId - Id del último agente asignado, o null en arranque en frío
 * @returns El id del siguiente agente disponible, o null si ninguno está disponible
 */
export function elegirSiguienteAgente(
  agentes: readonly { id: string }[],
  disponibles: Set<string>,
  ultimoAsignadoId: string | null
): string | null {
  if (disponibles.size === 0 || agentes.length === 0) {
    return null;
  }

  let startIndex = -1;
  if (ultimoAsignadoId !== null) {
    const idx = agentes.findIndex((agente) => agente.id === ultimoAsignadoId);
    if (idx !== -1) {
      startIndex = idx;
    }
  }

  const len = agentes.length;
  for (let i = 1; i <= len; i++) {
    const idx = (startIndex + i) % len;
    const agente = agentes[idx];
    if (disponibles.has(agente.id)) {
      return agente.id;
    }
  }

  return null;
}
