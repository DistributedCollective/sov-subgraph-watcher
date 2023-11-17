-- CreateTable
CREATE TABLE "ProposalForAlert" (
    "id" VARCHAR(64) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProposalForAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProposalForAlert_id_key" ON "ProposalForAlert"("id");
