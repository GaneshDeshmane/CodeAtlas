-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "repository" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "path" TEXT NOT NULL,

    CONSTRAINT "repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileContent" TEXT NOT NULL,
    "repositoryId" INTEGER NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chunk" (
    "chunkId" SERIAL NOT NULL,
    "data" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "filesId" INTEGER NOT NULL,

    CONSTRAINT "chunk_pkey" PRIMARY KEY ("chunkId")
);

-- CreateTable
CREATE TABLE "embedding" (
    "embeddingId" SERIAL NOT NULL,
    "data" vector(768) NOT NULL,
    "chunkId" INTEGER NOT NULL,

    CONSTRAINT "embedding_pkey" PRIMARY KEY ("embeddingId")
);

-- CreateTable
CREATE TABLE "UserQuery" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,

    CONSTRAINT "UserQuery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "embedding_chunkId_key" ON "embedding"("chunkId");

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repository"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chunk" ADD CONSTRAINT "chunk_filesId_fkey" FOREIGN KEY ("filesId") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "embedding" ADD CONSTRAINT "embedding_chunkId_fkey" FOREIGN KEY ("chunkId") REFERENCES "chunk"("chunkId") ON DELETE RESTRICT ON UPDATE CASCADE;
