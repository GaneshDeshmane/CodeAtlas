/*
  Warnings:

  - You are about to drop the column `data` on the `chunk` table. All the data in the column will be lost.
  - You are about to drop the column `fileName` on the `files` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[url]` on the table `repository` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `UserQuery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `chunk` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `chunk` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `embedding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `repository` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserQuery" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "chunk" DROP COLUMN "data",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "embedding" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "files" DROP COLUMN "fileName",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "path" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "repository" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "repository_url_key" ON "repository"("url");
