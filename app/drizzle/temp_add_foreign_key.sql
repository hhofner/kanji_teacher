BEGIN TRANSACTION;

-- 1. Create a new table with the foreign key constraint
CREATE TABLE kanji_new (
    id INTEGER PRIMARY KEY,
    date TEXT NOT NULL,
    character TEXT NOT NULL,
    kunyomi TEXT,
    onyomi TEXT,
    meanings TEXT,
    jlpt TEXT,
    strokeCount INTEGER,
    userId INTEGER,
    FOREIGN KEY (userId) REFERENCES user(id)
);

-- 2. Copy data from the original table to the new table
INSERT INTO kanji_new (id, date, character, kunyomi, onyomi, meanings, jlpt, strokeCount, userId)
SELECT id, date, character, kunyomi, onyomi, meanings, jlpt, strokeCount, userId
FROM kanji;

-- 3. Drop the original table
DROP TABLE kanji;

-- 4. Rename the new table to the original table's name
ALTER TABLE kanji_new RENAME TO kanji;

COMMIT;

