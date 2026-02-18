-- CreateEnum
CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SubscriberStatus" AS ENUM ('ACTIVE', 'UNSUBSCRIBED', 'BOUNCED', 'COMPLAINED');

-- CreateEnum
CREATE TYPE "CalendarEntryType" AS ENUM ('BLOG_POST', 'SOCIAL_POST', 'NEWSLETTER', 'AD_CAMPAIGN', 'CUSTOM');

-- CreateEnum
CREATE TYPE "CalendarEntryStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MarketingEventType" AS ENUM ('PAGE_VIEW', 'EMAIL_OPEN', 'EMAIL_CLICK', 'SOCIAL_ENGAGEMENT', 'AD_CLICK', 'AD_IMPRESSION', 'SUBSCRIBER_ADDED', 'SUBSCRIBER_REMOVED', 'BLOG_VIEW', 'CONVERSION');

-- CreateEnum
CREATE TYPE "AIContentType" AS ENUM ('BLOG_POST', 'NEWSLETTER', 'AD_COPY', 'SOCIAL_POST', 'SOCIAL_REPLY', 'SEO_OPTIMIZATION', 'AB_VARIANT', 'CALENDAR_PLAN', 'HASHTAGS', 'BRAND_REWRITE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SocialPostStatus" ADD VALUE 'PUBLISHING';
ALTER TYPE "SocialPostStatus" ADD VALUE 'FAILED';

-- AlterTable
ALTER TABLE "NewsletterCampaign" ADD COLUMN     "blocks" JSONB,
ADD COLUMN     "bounceCount" INTEGER DEFAULT 0,
ADD COLUMN     "clickRate" DOUBLE PRECISION,
ADD COLUMN     "fromEmail" TEXT,
ADD COLUMN     "fromName" TEXT,
ADD COLUMN     "openRate" DOUBLE PRECISION,
ADD COLUMN     "previewText" TEXT,
ADD COLUMN     "templateId" TEXT,
ADD COLUMN     "unsubscribeCount" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "SocialPost" ADD COLUMN     "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "clicks" INTEGER DEFAULT 0,
ADD COLUMN     "comments" INTEGER DEFAULT 0,
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "impressions" INTEGER DEFAULT 0,
ADD COLUMN     "likes" INTEGER DEFAULT 0,
ADD COLUMN     "parentPostId" TEXT,
ADD COLUMN     "shares" INTEGER DEFAULT 0,
ADD COLUMN     "socialAccountId" TEXT,
ADD COLUMN     "threadOrder" INTEGER DEFAULT 0;

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" JSONB,
    "excerpt" TEXT,
    "status" "BlogPostStatus" NOT NULL DEFAULT 'DRAFT',
    "featuredImage" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "canonicalUrl" TEXT,
    "publishAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "productId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogCategory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogTag" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPostCategory" (
    "blogPostId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "BlogPostCategory_pkey" PRIMARY KEY ("blogPostId","categoryId")
);

-- CreateTable
CREATE TABLE "BlogPostTag" (
    "blogPostId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "BlogPostTag_pkey" PRIMARY KEY ("blogPostId","tagId")
);

-- CreateTable
CREATE TABLE "NewsletterTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "blocks" JSONB,
    "thumbnail" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsletterTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "status" "SubscriberStatus" NOT NULL DEFAULT 'ACTIVE',
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterList" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsletterList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterListSubscriber" (
    "subscriberId" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsletterListSubscriber_pkey" PRIMARY KEY ("subscriberId","listId")
);

-- CreateTable
CREATE TABLE "SocialAccount" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountId" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "isConnected" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentCalendarEntry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "entryType" "CalendarEntryType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "color" TEXT,
    "status" "CalendarEntryStatus" NOT NULL DEFAULT 'PLANNED',
    "blogPostId" TEXT,
    "socialPostId" TEXT,
    "newsletterId" TEXT,
    "adCampaignId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentCalendarEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingAnalyticsEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "eventType" "MarketingEventType" NOT NULL,
    "source" TEXT NOT NULL,
    "sourceId" TEXT,
    "metric" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketingAnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandVoice" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "toneKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "avoidKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sampleContent" TEXT,
    "targetAudience" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandVoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIContentGeneration" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "contentType" "AIContentType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "tokensUsed" INTEGER,
    "rating" INTEGER,
    "wasUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIContentGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandingPage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudienceSegment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "filterQuery" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AudienceSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UTMLink" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "medium" TEXT NOT NULL,
    "campaign" TEXT NOT NULL,
    "term" TEXT,
    "content" TEXT,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UTMLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ABTest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "variantA" JSONB NOT NULL,
    "variantB" JSONB NOT NULL,
    "winnerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ABTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateLink" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenueCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffiliateLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PressKit" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PressKit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BlogPost_tenantId_idx" ON "BlogPost"("tenantId");

-- CreateIndex
CREATE INDEX "BlogPost_status_idx" ON "BlogPost"("status");

-- CreateIndex
CREATE INDEX "BlogPost_productId_idx" ON "BlogPost"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_tenantId_slug_key" ON "BlogPost"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "BlogCategory_tenantId_idx" ON "BlogCategory"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_tenantId_slug_key" ON "BlogCategory"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "BlogTag_tenantId_idx" ON "BlogTag"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogTag_tenantId_slug_key" ON "BlogTag"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "NewsletterTemplate_tenantId_idx" ON "NewsletterTemplate"("tenantId");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_tenantId_idx" ON "NewsletterSubscriber"("tenantId");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_status_idx" ON "NewsletterSubscriber"("status");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_tenantId_email_key" ON "NewsletterSubscriber"("tenantId", "email");

-- CreateIndex
CREATE INDEX "NewsletterList_tenantId_idx" ON "NewsletterList"("tenantId");

-- CreateIndex
CREATE INDEX "SocialAccount_tenantId_idx" ON "SocialAccount"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount_tenantId_platform_accountName_key" ON "SocialAccount"("tenantId", "platform", "accountName");

-- CreateIndex
CREATE INDEX "ContentCalendarEntry_tenantId_idx" ON "ContentCalendarEntry"("tenantId");

-- CreateIndex
CREATE INDEX "ContentCalendarEntry_date_idx" ON "ContentCalendarEntry"("date");

-- CreateIndex
CREATE INDEX "ContentCalendarEntry_entryType_idx" ON "ContentCalendarEntry"("entryType");

-- CreateIndex
CREATE INDEX "MarketingAnalyticsEvent_tenantId_idx" ON "MarketingAnalyticsEvent"("tenantId");

-- CreateIndex
CREATE INDEX "MarketingAnalyticsEvent_date_idx" ON "MarketingAnalyticsEvent"("date");

-- CreateIndex
CREATE INDEX "MarketingAnalyticsEvent_eventType_idx" ON "MarketingAnalyticsEvent"("eventType");

-- CreateIndex
CREATE INDEX "MarketingAnalyticsEvent_source_sourceId_idx" ON "MarketingAnalyticsEvent"("source", "sourceId");

-- CreateIndex
CREATE INDEX "BrandVoice_tenantId_idx" ON "BrandVoice"("tenantId");

-- CreateIndex
CREATE INDEX "AIContentGeneration_tenantId_idx" ON "AIContentGeneration"("tenantId");

-- CreateIndex
CREATE INDEX "AIContentGeneration_contentType_idx" ON "AIContentGeneration"("contentType");

-- CreateIndex
CREATE INDEX "LandingPage_tenantId_idx" ON "LandingPage"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "LandingPage_tenantId_slug_key" ON "LandingPage"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "AudienceSegment_tenantId_idx" ON "AudienceSegment"("tenantId");

-- CreateIndex
CREATE INDEX "UTMLink_tenantId_idx" ON "UTMLink"("tenantId");

-- CreateIndex
CREATE INDEX "ABTest_tenantId_idx" ON "ABTest"("tenantId");

-- CreateIndex
CREATE INDEX "AffiliateLink_tenantId_idx" ON "AffiliateLink"("tenantId");

-- CreateIndex
CREATE INDEX "PressKit_tenantId_idx" ON "PressKit"("tenantId");

-- CreateIndex
CREATE INDEX "SocialPost_socialAccountId_idx" ON "SocialPost"("socialAccountId");

-- CreateIndex
CREATE INDEX "SocialPost_parentPostId_idx" ON "SocialPost"("parentPostId");

-- AddForeignKey
ALTER TABLE "NewsletterCampaign" ADD CONSTRAINT "NewsletterCampaign_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "NewsletterTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "SocialAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_parentPostId_fkey" FOREIGN KEY ("parentPostId") REFERENCES "SocialPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostCategory" ADD CONSTRAINT "BlogPostCategory_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostCategory" ADD CONSTRAINT "BlogPostCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BlogCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostTag" ADD CONSTRAINT "BlogPostTag_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostTag" ADD CONSTRAINT "BlogPostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "BlogTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsletterListSubscriber" ADD CONSTRAINT "NewsletterListSubscriber_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "NewsletterSubscriber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsletterListSubscriber" ADD CONSTRAINT "NewsletterListSubscriber_listId_fkey" FOREIGN KEY ("listId") REFERENCES "NewsletterList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentCalendarEntry" ADD CONSTRAINT "ContentCalendarEntry_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentCalendarEntry" ADD CONSTRAINT "ContentCalendarEntry_socialPostId_fkey" FOREIGN KEY ("socialPostId") REFERENCES "SocialPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;
