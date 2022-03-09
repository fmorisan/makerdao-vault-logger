-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cdp" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "create_tx" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "block_number" INTEGER NOT NULL,
    "datetime_created" DATETIME,
    CONSTRAINT "Cdp_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Address" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Cdp" ("block_number", "create_tx", "datetime_created", "id", "ownerId") SELECT "block_number", "create_tx", "datetime_created", "id", "ownerId" FROM "Cdp";
DROP TABLE "Cdp";
ALTER TABLE "new_Cdp" RENAME TO "Cdp";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
