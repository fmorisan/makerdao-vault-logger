/*
  Warnings:

  - Added the required column `block_number` to the `Cdp` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cdp" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "create_tx" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "block_number" INTEGER NOT NULL,
    CONSTRAINT "Cdp_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Address" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Cdp" ("create_tx", "id", "ownerId") SELECT "create_tx", "id", "ownerId" FROM "Cdp";
DROP TABLE "Cdp";
ALTER TABLE "new_Cdp" RENAME TO "Cdp";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
