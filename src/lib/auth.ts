import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "ci_session";
const ALG = "HS256";

export interface SesionPayload {
  username: string;
  role: string;
  markupExtra: number;
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET debe tener al menos 32 caracteres");
  }
  return new TextEncoder().encode(secret);
}

export async function crearTokenSesion(user: SesionPayload): Promise<string> {
  return new SignJWT({
    sub: user.username,
    role: user.role,
    markupExtra: user.markupExtra,
  })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function obtenerSesion(token: string): Promise<SesionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      username: String(payload.sub ?? ""),
      role: String(payload.role ?? "user"),
      markupExtra: Number(payload.markupExtra ?? 0),
    };
  } catch {
    return null;
  }
}

export async function verificarToken(token: string): Promise<boolean> {
  return (await obtenerSesion(token)) !== null;
}

export async function obtenerSesionDeRequest(req: NextRequest): Promise<SesionPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return obtenerSesion(token);
}

export const AUTH_COOKIE = COOKIE_NAME;
