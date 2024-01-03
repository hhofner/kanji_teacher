CREATE TABLE `setting` (
	`id` integer PRIMARY KEY NOT NULL,
	`isAutoReset` integer DEFAULT true NOT NULL,
	`userId` integer,
	`lastKanjiIndex` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
DROP TABLE `settings`;