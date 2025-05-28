-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "payment_type" VARCHAR(110),
ADD COLUMN     "snap_redirect_url" VARCHAR(255),
ADD COLUMN     "snap_token" VARCHAR(255);
