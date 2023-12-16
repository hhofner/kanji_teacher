CREATE TABLE `writingHistory` (
	`id` integer,
	`datetime` text,
	`character` text,
	`type` text,
	FOREIGN KEY (`id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
