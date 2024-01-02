CREATE TABLE `writingLog` (
	`id` integer PRIMARY KEY NOT NULL,
	`datetime` text,
	`character` text,
	`userId` integer,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
DROP TABLE `writingHistory`;