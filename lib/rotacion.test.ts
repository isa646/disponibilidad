import { describe, expect, it } from "vitest";
import { elegirSiguienteAgente } from "./rotacion";

const AGENTES = [
  { id: "agente1" },
  { id: "agente2" },
  { id: "agente3" },
  { id: "agente4" },
  { id: "agente5" },
  { id: "agente6" },
];

describe("elegirSiguienteAgente", () => {
  it("devuelve null cuando ningún agente está disponible", () => {
    const result = elegirSiguienteAgente(AGENTES, new Set(), "agente1");
    expect(result).toBeNull();
  });

  it("devuelve siempre el único agente disponible", () => {
    const disponibles = new Set(["agente3"]);
    expect(elegirSiguienteAgente(AGENTES, disponibles, null)).toBe("agente3");
    expect(elegirSiguienteAgente(AGENTES, disponibles, "agente1")).toBe(
      "agente3"
    );
    expect(elegirSiguienteAgente(AGENTES, disponibles, "agente6")).toBe(
      "agente3"
    );
  });

  it("rota al siguiente disponible en orden circular", () => {
    const disponibles = new Set(["agente1", "agente2"]);
    expect(elegirSiguienteAgente(AGENTES, disponibles, "agente1")).toBe(
      "agente2"
    );
    expect(elegirSiguienteAgente(AGENTES, disponibles, "agente2")).toBe(
      "agente1"
    );
  });

  it("hace wrap al inicio del array cuando el último es el último agente", () => {
    const disponibles = new Set(["agente1", "agente2"]);
    expect(elegirSiguienteAgente(AGENTES, disponibles, "agente6")).toBe(
      "agente1"
    );
  });

  it("arranca desde el primer disponible cuando ultimoAsignado es null", () => {
    const disponibles = new Set(["agente2", "agente4"]);
    expect(elegirSiguienteAgente(AGENTES, disponibles, null)).toBe("agente2");
  });

  it("arranca desde el primer disponible cuando ultimoAsignado no existe", () => {
    const disponibles = new Set(["agente1", "agente5"]);
    expect(elegirSiguienteAgente(AGENTES, disponibles, "agente99")).toBe(
      "agente1"
    );
  });

  it("omite agentes no disponibles en la rotación", () => {
    const disponibles = new Set(["agente1", "agente3", "agente5"]);
    expect(elegirSiguienteAgente(AGENTES, disponibles, "agente1")).toBe(
      "agente3"
    );
    expect(elegirSiguienteAgente(AGENTES, disponibles, "agente3")).toBe(
      "agente5"
    );
    expect(elegirSiguienteAgente(AGENTES, disponibles, "agente5")).toBe(
      "agente1"
    );
  });
});
