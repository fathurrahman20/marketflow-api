/*
  Warnings:

  - Made the column `imageUrl` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `imageId` on table `products` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "products" ALTER COLUMN "imageUrl" SET NOT NULL,
ALTER COLUMN "imageId" SET NOT NULL;
