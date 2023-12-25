CREATE TABLE `kanji` (
	`id` integer PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`character` text NOT NULL,
	`kunyomi` text,
	`onyomi` text,
	`meanings` text,
	`jlpt` text,
	`strokeCount` integer,
	`userId` integer,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY NOT NULL,
	`email` text,
	`password` text,
	`salt` text
);
--> statement-breakpoint
CREATE TABLE `writingHistory` (
	`id` integer,
	`datetime` text,
	`character` text,
	`type` text,
	FOREIGN KEY (`id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
