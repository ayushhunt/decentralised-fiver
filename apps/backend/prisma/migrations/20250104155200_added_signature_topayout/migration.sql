/*
  Warnings:

  - Added the required column `signature` to the `Payouts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payouts" ADD COLUMN     "signature" TEXT NOT NULL;
