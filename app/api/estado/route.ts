import { NextResponse } from "next/server";
import { getEstadoTodos } from "@/lib/kv";

export const dynamic = 'force-dynamic';

const ALLOWED_ORIGINS = [
  "https://app.gohighlevel.com",
  /\.gohighlevel\.com$/,
  /\.leadconnectorhq\.com$/,
];

function isOriginAllowed(origin: string): boolean {
  return ALLOWED_ORIGINS.some((allowed) =>
    typeof allowed === "string" ? allowed === origin : allowed.test(origin)
  );
}

function corsHeaders(origin: string | null): HeadersInit {
  const headers: Record<string, string> = {
    "Cache-Control": "no-store, no-cache, must-revalidate",
  };

  if (!origin || !isOriginAllowed(origin)) {
    return headers;
  }

  return {
    ...headers,
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const agentes = await getEstadoTodos();

  return NextResponse.json(
    { agentes },
    { headers: corsHeaders(origin) }
  );
}