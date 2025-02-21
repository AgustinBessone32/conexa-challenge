/*
  Warnings:

  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Movie" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "episode_id" INTEGER NOT NULL,
    "opening_crawl" TEXT NOT NULL,
    "director" TEXT NOT NULL,
    "producer" TEXT NOT NULL,
    "release_date" TEXT NOT NULL,
    "characters" TEXT[],
    "planets" TEXT[],
    "starships" TEXT[],
    "vehicles" TEXT[],
    "species" TEXT[],
    "created" TEXT NOT NULL,
    "edited" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);
