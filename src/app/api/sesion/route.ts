import { NextRequest, NextResponse } from "next/server";
import { obtenerSesionDeRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const sesion = await obtenerSesionDeRequest(req);
  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  return NextResponse.json({
    username: sesion.username,
    role: sesion.role,
    markupExtra: sesion.markupExtra,
  });
}
