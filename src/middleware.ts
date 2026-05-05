import { NextRequest, NextResponse } from "next/server";
import { verificarToken, AUTH_COOKIE } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/api/login", "/api/uploads", "/api/health", "/api/p", "/p", "/catalogo", "/api/catalogo", "/clientes"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (token && (await verificarToken(token))) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icon.*).*)"],
};
