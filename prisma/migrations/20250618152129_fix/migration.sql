-- AlterTable
ALTER TABLE "deleted_accounts" ADD COLUMN     "is_seed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "is_seed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_seed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "webhooks_abacatepay" ADD COLUMN     "is_seed" BOOLEAN NOT NULL DEFAULT false;
