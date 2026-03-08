-- CreateTable
CREATE TABLE "people" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "company" TEXT,
    "role" TEXT,
    "category" TEXT NOT NULL DEFAULT 'other',
    "relationshipStrength" INTEGER NOT NULL DEFAULT 3,
    "notes" TEXT,
    "topics" TEXT,
    "introducedBy" TEXT,
    "location" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "linkedinUrl" TEXT,
    "twitterUrl" TEXT,
    "website" TEXT,
    "preferredChannel" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastInteractionAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "people_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_tags" (
    "personId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "person_tags_pkey" PRIMARY KEY ("personId","tagId")
);

-- CreateTable
CREATE TABLE "identities" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "identities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interactions" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "summary" TEXT,
    "direction" TEXT NOT NULL DEFAULT 'mutual',
    "channel" TEXT,
    "requiresFollowUp" BOOLEAN NOT NULL DEFAULT false,
    "followUpDueAt" TIMESTAMP(3),
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signals" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "source" TEXT,
    "sourceUrl" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "summary" TEXT,
    "relevanceScore" INTEGER NOT NULL DEFAULT 5,
    "unread" BOOLEAN NOT NULL DEFAULT true,
    "needsAction" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "signals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "value_events" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "outcome" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "value_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suggestions" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 2,
    "suggestedAction" TEXT,
    "suggestedChannel" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "generatedFrom" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- AddForeignKey
ALTER TABLE "person_tags" ADD CONSTRAINT "person_tags_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_tags" ADD CONSTRAINT "person_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identities" ADD CONSTRAINT "identities_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signals" ADD CONSTRAINT "signals_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "value_events" ADD CONSTRAINT "value_events_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;
