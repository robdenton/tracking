-- CreateTable
CREATE TABLE "people" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "lastInteractionAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "person_tags" (
    "personId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    PRIMARY KEY ("personId", "tagId"),
    CONSTRAINT "person_tags_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "person_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "identities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "personId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "identities_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "interactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "personId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "occurredAt" DATETIME NOT NULL,
    "summary" TEXT,
    "direction" TEXT NOT NULL DEFAULT 'mutual',
    "channel" TEXT,
    "requiresFollowUp" BOOLEAN NOT NULL DEFAULT false,
    "followUpDueAt" DATETIME,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "interactions_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "signals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "personId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "source" TEXT,
    "sourceUrl" TEXT,
    "occurredAt" DATETIME NOT NULL,
    "summary" TEXT,
    "relevanceScore" INTEGER NOT NULL DEFAULT 5,
    "unread" BOOLEAN NOT NULL DEFAULT true,
    "needsAction" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "signals_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "value_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "personId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "occurredAt" DATETIME NOT NULL,
    "summary" TEXT NOT NULL,
    "outcome" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "value_events_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "suggestions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "personId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 2,
    "suggestedAction" TEXT,
    "suggestedChannel" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "generatedFrom" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "suggestions_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "personId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "notes_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");
