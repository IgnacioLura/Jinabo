import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { obtenerSesionDeRequest } from "@/lib/auth";

async function soloAdmin(req: NextRequest) {
  const sesion = await obtenerSesionDeRequest(req);
  if (!sesion || sesion.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const err = await soloAdmin(req);
  if (err) return err;

  const usuarios = await prisma.user.findMany({
    select: { id: true, username: true, role: true, markupExtra: true },
    orderBy: { username: "asc" },
  });
  return NextResponse.json(usuarios);
}

export async function POST(req: NextRequest) {
  const err = await soloAdmin(req);
  if (err) return err;

  const { username, password, role, markupExtra } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Usuario y contraseña requeridos" }, { status: 400 });
  }

  const existe = await prisma.user.findUnique({ where: { username } });
  if (existe) {
    return NextResponse.json({ error: "El usuario ya existe" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      username: String(username).trim(),
      passwordHash,
      role: role === "admin" ? "admin" : "user",
      markupExtra: Number(markupExtra) || 0,
    },
    select: { id: true, username: true, role: true, markupExtra: true },
  });

  return NextResponse.json(user, { status: 201 });
}
