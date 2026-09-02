import { describe, expect, it } from "vitest";
import {
  asignacionesKey,
  disponibleKey,
  ultimoAsignadoKey,
  withKvPrefix,
} from "./kv-keys";

describe("withKvPrefix", () => {
  it("deja la clave igual si no hay prefijo", () => {
    expect(withKvPrefix("rotacion:ultimo_asignado", "")).toBe(
      "rotacion:ultimo_asignado"
    );
  });

  it("antepone el namespace y quita dos puntos extras", () => {
    expect(withKvPrefix("rotacion:ultimo_asignado", "mdtours:")).toBe(
      "mdtours:rotacion:ultimo_asignado"
    );
  });
});

describe("claves KV", () => {
  it("nombra disponibilidad, rotación y asignaciones bajo el prefijo", () => {
    expect(disponibleKey("abc", "mdtours")).toBe(
      "mdtours:agente:abc:disponible"
    );
    expect(ultimoAsignadoKey("mdtours")).toBe(
      "mdtours:rotacion:ultimo_asignado"
    );
    expect(asignacionesKey("abc", "2026-09-02", "mdtours")).toBe(
      "mdtours:asignaciones:abc:2026-09-02"
    );
  });
});
