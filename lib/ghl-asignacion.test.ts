import { describe, expect, it } from "vitest";
import {
  buildCustomFieldsPayload,
  getAgentDisplayName,
  getCostaRicaTimestamp,
} from "./ghl-asignacion";

describe("getAgentDisplayName", () => {
  it("prefiere name sobre firstName/lastName", () => {
    expect(
      getAgentDisplayName({
        name: "María García",
        firstName: "Ana",
        lastName: "López",
      })
    ).toBe("María García");
  });

  it("concatena firstName y lastName si no hay name", () => {
    expect(
      getAgentDisplayName({
        firstName: "Ana",
        lastName: "López",
      })
    ).toBe("Ana López");
  });
});

describe("buildCustomFieldsPayload", () => {
  it("genera customFields con id y field_value", () => {
    expect(
      buildCustomFieldsPayload(
        {
          asignadoA: "field-a",
          asignadoEl: "field-b",
          asignadoALas: "field-c",
        },
        {
          asignadoA: "Juan Pérez",
          asignadoEl: "2026-07-20",
          asignadoALas: "14:30",
        }
      )
    ).toEqual({
      customFields: [
        { id: "field-a", field_value: "Juan Pérez" },
        { id: "field-b", field_value: "2026-07-20" },
        { id: "field-c", field_value: "14:30" },
      ],
    });
  });
});

describe("getCostaRicaTimestamp", () => {
  it("formatea fecha y hora en zona America/Costa_Rica", () => {
    const { fecha, hora } = getCostaRicaTimestamp(
      new Date("2026-07-20T18:45:00.000Z")
    );

    expect(fecha).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(hora).toMatch(/^\d{2}:\d{2}$/);
  });
});
