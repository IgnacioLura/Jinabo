import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { obtenerSesionDeRequest } from "@/lib/auth";

interface Params {
  params: Promise<{ id: string }>;
}

async function soloAdmin(req: NextRequest) {
  const sesion = await obtenerSesionDeRequest(req);
  if (!sesion || sesion.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  return null;
}

export async function PUT(req: NextRequest, { params }: Params) {
  const err = await soloAdmin(req);
  if (err) return err;

  const { id } = await params;
  const { username, password, role, markupExtra } = await req.json();

  const data: Record<string, unknown> = {
    role: role === "admin" ? "admin" : "user",
    markupExtra: Number(markupExtra) || 0,
  };

  if (username) data.username = String(username).trim();
  if (password) data.passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.update({
    where: { id: Number(id) },
    data,
    select: { id: true, username: true, role: true, markupExtra: true },
  });

  return NextResponse.json(user);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const err = await soloAdmin(req);
  if (err) return err;

  const { id } = await params;
  const sesion = await obtenerSesionDeRequest(req);

  const user = await prisma.user.findUnique({ where: { id: Number(id) } });
  if (!user) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  if (user.username === sesion?.username) {
    return NextResponse.json({ error: "No podés eliminar tu propio usuario" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
