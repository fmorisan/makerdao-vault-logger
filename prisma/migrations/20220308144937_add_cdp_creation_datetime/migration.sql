-- AlterTable
-- Add datetime_created field with default value
ALTER TABLE "Cdp" ADD COLUMN "datetime_created" DATETIME;
UPDATE "Cdp" SET "datetime_created"="2022-03-09T00:00:00Z" WHERE 1=1;


-- RedefineTables
-- Set the datetime_created field to NOT NULL
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_cdp" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "create_tx" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "block_number" INTEGER NOT NULL,
    "datetime_created" DATETIME NOT NULL,
    CONSTRAINT "Cdp_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Address" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_cdp" ("create_tx", "id", "ownerId", "block_number", "datetime_created") SELECT "create_tx", "id", "ownerId", "block_number", "datetime_created" FROM "Cdp";
DROP TABLE "Cdp";
ALTER TABLE "new_cdp" RENAME TO "Cdp";

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;