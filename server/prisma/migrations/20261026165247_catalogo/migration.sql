-- CreateEnum
CREATE TYPE "Niche" AS ENUM ('moda', 'casa', 'tecnologia', 'saude');

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "niche" "Niche" NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "price" DECIMAL(10,2) NOT NULL,
    "original_price" DECIMAL(10,2),
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "sizes" TEXT[],
    "colors" TEXT[],
    "fabric" TEXT NOT NULL DEFAULT '',
    "stock" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "placement" TEXT NOT NULL DEFAULT 'todas',
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL DEFAULT '',
    "cta_label" TEXT NOT NULL,
    "cta_href" TEXT NOT NULL,
    "image" TEXT,
    "mobile_image" TEXT,
    "show_text" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "products_niche_idx" ON "products"("niche");
