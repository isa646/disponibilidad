import Link from "next/link";
import {
  formatearFechaCostaRicaDesdeString,
  sumarDiasFecha,
} from "@/lib/fecha-costa-rica";

type Props = {
  fecha: string;
  puedeAvanzar: boolean;
  total: number;
  email?: string;
};

function buildHref(fecha: string, email?: string): string {
  const params = new URLSearchParams({ fecha });
  if (email) params.set("email", email);
  return `/admin?${params.toString()}`;
}

export default function AdminDateNav({
  fecha,
  puedeAvanzar,
  total,
  email,
}: Props) {
  const fechaAnterior = sumarDiasFecha(fecha, -1);
  const fechaSiguiente = sumarDiasFecha(fecha, 1);

  const linkClass =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm hover:bg-gray-50 hover:text-gray-900";

  return (
    <div className="mb-3 flex items-center gap-2">
      <Link
        href={buildHref(fechaAnterior, email)}
        aria-label="Día anterior"
        className={linkClass}
      >
        ←
      </Link>

      <p className="flex-1 text-center text-xs text-gray-500">
        Asignaciones del día ({formatearFechaCostaRicaDesdeString(fecha)}):{" "}
        <span className="font-medium text-gray-700">{total}</span>
      </p>

      {puedeAvanzar ? (
        <Link
          href={buildHref(fechaSiguiente, email)}
          aria-label="Día siguiente"
          className={linkClass}
        >
          →
        </Link>
      ) : (
        <span
          aria-hidden
          className={`${linkClass} pointer-events-none opacity-30`}
        >
          →
        </span>
      )}
    </div>
  );
}
