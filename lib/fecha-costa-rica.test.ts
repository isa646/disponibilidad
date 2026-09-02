import { describe, expect, it } from "vitest";
import {
  getFechaHoyCostaRica,
  resolverFechaConsulta,
  sumarDiasFecha,
} from "./fecha-costa-rica";

describe("getFechaHoyCostaRica", () => {
  it("usa la zona horaria de Costa Rica (UTC-6 sin DST)", () => {
    // 2026-07-09 05:30 UTC = 2026-07-08 23:30 en Costa Rica
    const fecha = new Date("2026-07-09T05:30:00.000Z");
    expect(getFechaHoyCostaRica(fecha)).toBe("2026-07-08");
  });

  it("cambia de día después de medianoche en Costa Rica", () => {
    // 2026-07-09 06:30 UTC = 2026-07-09 00:30 en Costa Rica
    const fecha = new Date("2026-07-09T06:30:00.000Z");
    expect(getFechaHoyCostaRica(fecha)).toBe("2026-07-09");
  });

  it("resta un día correctamente", () => {
    expect(sumarDiasFecha("2026-07-09", -1)).toBe("2026-07-08");
  });

  it("rechaza fechas futuras en resolverFechaConsulta", () => {
    const hoy = getFechaHoyCostaRica();
    expect(resolverFechaConsulta("2099-01-01")).toBe(hoy);
  });
});
