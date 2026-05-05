-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "markupExtra" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- Seed default users (idempotent)
INSERT INTO "User" ("username", "passwordHash", "role", "markupExtra")
VALUES
  ('admin', '$2b$10$vUNTJ5uxytcYA9TjJAqWDea9bvg1Fy4wtxIvwA2mS1.jdX390LwMi', 'admin', 0),
  ('VGarcia', '$2b$10$ayo8rLMRVdojY9iArO64Y.BwLmJiGACkMBXyVRk0KBW4oBzksMR.y', 'user', 20)
ON CONFLICT ("username") DO NOTHING;
