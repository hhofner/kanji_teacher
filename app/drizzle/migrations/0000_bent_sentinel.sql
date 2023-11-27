CREATE TABLE `kanji` (
	`id` integer PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`character` text NOT NULL,
	`kunyomi` text,
	`onyomi` text,
	`meanings` text,
	`jlpt` text
);
