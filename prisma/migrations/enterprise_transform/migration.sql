-- CreateEnum for new roles
DO $$ BEGIN
 CREATE TYPE "PropertyStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'RENTED', 'MAINTENANCE', 'UNAVAILABLE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "LeadStatus" AS ENUM ('PENDING', 'CONTACTED', 'SCHEDULED', 'NEGOTIATING', 'CLOSED_WON', 'CLOSED_LOST', 'CANCELLED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "LeadPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "TransactionType" AS ENUM ('RENT', 'PURCHASE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED', 'REFUNDED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Add new property types
ALTER TYPE "PropertyType" ADD VALUE IF NOT EXISTS 'LAND';
ALTER TYPE "PropertyType" ADD VALUE IF NOT EXISTS 'OFFICE';

-- Step 1: Create Company table
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- Step 2: Create default company
INSERT INTO "Company" ("id", "name", "description", "email", "phone", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'Real Estate Solutions Inc.', 'Leading property management company', 'info@realestate.com', '+1-234-567-8900', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Step 3: Create Country table
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Country_name_key" ON "Country"("name");
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");
CREATE INDEX "Country_companyId_idx" ON "Country"("companyId");

-- Step 4: Create Area table
CREATE TABLE "Area" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "countryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Area_countryId_idx" ON "Area"("countryId");

-- Step 5: Add phone field to User
ALTER TABLE "User" ADD COLUMN "phone" TEXT;

-- Step 6: Add companyId to User (nullable for now)
ALTER TABLE "User" ADD COLUMN "companyId" TEXT;

CREATE INDEX "User_companyId_idx" ON "User"("companyId");

-- Step 7: Update Role enum - Change AGENT to EMPLOYEE
-- First, update all existing AGENT users to a temporary value
UPDATE "User" SET "role" = 'CUSTOMER' WHERE "role" = 'AGENT';

-- Drop and recreate the enum
ALTER TYPE "Role" RENAME TO "Role_old";
CREATE TYPE "Role" AS ENUM ('EMPLOYEE', 'CUSTOMER', 'ADMIN', 'SUPERADMIN');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role" USING "role"::text::"Role";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';
DROP TYPE "Role_old";

-- Step 8: Assign all users to the default company
UPDATE "User" SET "companyId" = (SELECT "id" FROM "Company" LIMIT 1) WHERE "companyId" IS NULL;

-- Step 9: Create EmployeeArea table
CREATE TABLE "EmployeeArea" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "canManage" BOOLEAN NOT NULL DEFAULT true,
    "isLead" BOOLEAN NOT NULL DEFAULT false,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeArea_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EmployeeArea_employeeId_areaId_key" ON "EmployeeArea"("employeeId", "areaId");
CREATE INDEX "EmployeeArea_employeeId_idx" ON "EmployeeArea"("employeeId");
CREATE INDEX "EmployeeArea_areaId_idx" ON "EmployeeArea"("areaId");

-- Step 10: Modify Property table
-- Add new columns (nullable first)
ALTER TABLE "Property" ADD COLUMN "status" "PropertyStatus" NOT NULL DEFAULT 'AVAILABLE';
ALTER TABLE "Property" ADD COLUMN "companyId" TEXT;
ALTER TABLE "Property" ADD COLUMN "areaId" TEXT;
ALTER TABLE "Property" ADD COLUMN "assignedToId" TEXT;

-- Assign all properties to the default company
UPDATE "Property" SET "companyId" = (SELECT "id" FROM "Company" LIMIT 1) WHERE "companyId" IS NULL;

-- Now make companyId required
ALTER TABLE "Property" ALTER COLUMN "companyId" SET NOT NULL;

-- Create indexes
CREATE INDEX "Property_companyId_idx" ON "Property"("companyId");
CREATE INDEX "Property_areaId_idx" ON "Property"("areaId");
CREATE INDEX "Property_assignedToId_idx" ON "Property"("assignedToId");
CREATE INDEX "Property_status_idx" ON "Property"("status");
CREATE INDEX "Property_purpose_idx" ON "Property"("purpose");
CREATE INDEX "Property_propertyType_idx" ON "Property"("propertyType");

-- Drop old columns from Property
ALTER TABLE "Property" DROP COLUMN "ownerId";
ALTER TABLE "Property" DROP COLUMN "ownerType";

-- Step 11: Drop AgentPermission table
DROP TABLE IF EXISTS "AgentPermission";

-- Step 12: Drop OwnerType enum
DROP TYPE IF EXISTS "OwnerType";

-- Step 13: Create Lead table
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "message" TEXT,
    "phone" TEXT,
    "preferredContactMethod" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "LeadPriority" NOT NULL DEFAULT 'MEDIUM',
    "assignedToId" TEXT,
    "followUpDate" TIMESTAMP(3),
    "notes" TEXT,
    "convertedToTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Lead_customerId_idx" ON "Lead"("customerId");
CREATE INDEX "Lead_propertyId_idx" ON "Lead"("propertyId");
CREATE INDEX "Lead_assignedToId_idx" ON "Lead"("assignedToId");
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- Step 14: Create Transaction table
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paymentMethod" TEXT,
    "paymentDate" TIMESTAMP(3),
    "contractStartDate" TIMESTAMP(3),
    "contractEndDate" TIMESTAMP(3),
    "documents" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Transaction_customerId_idx" ON "Transaction"("customerId");
CREATE INDEX "Transaction_propertyId_idx" ON "Transaction"("propertyId");
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- Step 15: Create Message table
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "propertyId" TEXT,
    "leadId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");
CREATE INDEX "Message_receiverId_idx" ON "Message"("receiverId");
CREATE INDEX "Message_read_idx" ON "Message"("read");

-- Add Foreign Keys
ALTER TABLE "Country" ADD CONSTRAINT "Country_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Area" ADD CONSTRAINT "Area_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "EmployeeArea" ADD CONSTRAINT "EmployeeArea_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EmployeeArea" ADD CONSTRAINT "EmployeeArea_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Property" ADD CONSTRAINT "Property_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Property" ADD CONSTRAINT "Property_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Property" ADD CONSTRAINT "Property_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Lead" ADD CONSTRAINT "Lead_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Lead" ADD CONSTRAINT "Lead_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
