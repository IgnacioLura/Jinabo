import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { uploadDir } from "@/lib/storage";

interface Params {
  params: Promise<{ file: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { file } = await params;
  const safe = path.basename(file);
  if (!/^[\w-]+\.(webp|jpg|jpeg|png)$/i.test(safe)) {
    return NextResponse.json({ error: "Archivo inválido" }, { status: 400 });
  }
  const full = path.join(uploadDir(), safe);
  try {
    const buf = await fs.readFile(full);
    const ext = path.extname(safe).slice(1).toLowerCase();
    const ct = ext === "webp" ? "image/webp" : ext === "png" ? "image/png" : "image/jpeg";
    return new NextResponse(buf as unknown as BodyInit, {
      headers: {
        "Content-Type": ct,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
}
