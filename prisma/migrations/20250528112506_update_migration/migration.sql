/*
  Warnings:

  - Added the required column `city` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postalCode` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "payment_type" VARCHAR(110);
