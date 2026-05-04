import path from "path";
import fs from "fs/promises";

export function uploadDir(): string {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
}

export async function ensureUploadDir(): Promise<string> {
  const dir = uploadDir();
  await fs.mkdir(dir, { recursive: true });
  return dir;
}
