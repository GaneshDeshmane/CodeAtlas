-- CreateTable
CREATE TABLE "repository" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "path" TEXT NOT NULL,

    CONSTRAINT "repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "embedding" (
    "ansid" TEXT NOT NULL,
    "chat" TEXT NOT NULL,

    CONSTRAINT "embedding_pkey" PRIMARY KEY ("ansid")
);

-- CreateTable
CREATE TABLE "UserQuery" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,

    CONSTRAINT "UserQuery_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserQuery" ADD CONSTRAINT "UserQuery_id_fkey" FOREIGN KEY ("id") REFERENCES "embedding"("ansid") ON DELETE RESTRICT ON UPDATE CASCADE;
