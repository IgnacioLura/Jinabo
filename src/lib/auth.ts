import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "ci_session";
const ALG = "HS256";

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET debe tener al menos 32 caracteres");
  }
  return new TextEncoder().encode(secret);
}

export async function crearTokenSesion(): Promise<string> {
  return new SignJWT({ sub: "carlos" })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function verificarToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export function passwordCorrecta(input: string): boolean {
  const real = process.env.APP_PASSWORD;
  if (!real) return false;
  return input === real;
}

export const AUTH_COOKIE = COOKIE_NAME;
