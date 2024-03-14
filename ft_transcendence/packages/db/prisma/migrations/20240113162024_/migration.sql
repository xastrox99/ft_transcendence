-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('INVITING', 'WAITING', 'STARTING', 'ENDING');

-- CreateTable
CREATE TABLE "GameOnUsers" (
    "gameId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "winner" BOOLEAN NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameOnUsers_pkey" PRIMARY KEY ("gameId","userId")
);

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'WAITING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GameOnUsers" ADD CONSTRAINT "GameOnUsers_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "GameOnUsers" ADD CONSTRAINT "GameOnUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("uid") ON DELETE CASCADE ON UPDATE NO ACTION;
