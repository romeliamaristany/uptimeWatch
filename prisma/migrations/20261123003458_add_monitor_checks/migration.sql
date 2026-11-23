-- CreateTable
CREATE TABLE "MonitorCheck" (
    "id" SERIAL NOT NULL,
    "monitorId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "statusCode" INTEGER,
    "responseTimeMs" INTEGER NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonitorCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonitorCheck_monitorId_checkedAt_idx" ON "MonitorCheck"("monitorId", "checkedAt");

-- AddForeignKey
ALTER TABLE "MonitorCheck" ADD CONSTRAINT "MonitorCheck_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "Monitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
