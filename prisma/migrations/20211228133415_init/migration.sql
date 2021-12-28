-- CreateEnum
CREATE TYPE "SectionVariant" AS ENUM ('work', 'plan', 'tomorrow');

-- CreateTable
CREATE TABLE "day" (
    "id" SERIAL NOT NULL,
    "day" TEXT NOT NULL,
    "owner" TEXT NOT NULL,

    CONSTRAINT "day_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scope" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "owner" TEXT NOT NULL,

    CONSTRAINT "scope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "section" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "dayId" INTEGER,
    "rank" INTEGER NOT NULL DEFAULT 60000,
    "owner" TEXT NOT NULL,
    "variant" "SectionVariant" NOT NULL DEFAULT E'work',

    CONSTRAINT "section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task" (
    "id" SERIAL NOT NULL,
    "summary" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT E'',
    "time" INTEGER NOT NULL DEFAULT 0,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "start" TEXT,
    "owner" TEXT NOT NULL,
    "scopeId" INTEGER,
    "sectionId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "section" ADD CONSTRAINT "section_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "day"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_scopeId_fkey" FOREIGN KEY ("scopeId") REFERENCES "scope"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
