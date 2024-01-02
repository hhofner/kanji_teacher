-- ALTER TABLE writingHistory ADD `userId` integer REFERENCES user(id);--> statement-breakpoint
/*
 SQLite does not support "Creating foreign key on existing column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/
-- Rename table
-- Create new table
-- Copy data from old table to new table
-- Drop old table

ALTER TABLE writingHistory RENAME TO writingHistory_old;
CREATE TABLE `writingHistory` (
    id integer PRIMARY KEY AUTOINCREMENT,
    datetime text NOT NULL,
    character text NOT NULL,
    type text NOT NULL
    FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);

-- Copy data from old table to new table if needed

DELETE TABLE writingHistory_old;
