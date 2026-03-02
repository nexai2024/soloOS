-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "longDescription" TEXT,
ADD COLUMN     "marketingContent" JSONB,
ADD COLUMN     "shortDescription" TEXT,
ADD COLUMN     "slogan" TEXT;
