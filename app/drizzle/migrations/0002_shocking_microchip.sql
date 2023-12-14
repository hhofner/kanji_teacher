CREATE TABLE `user` (
	`id` integer PRIMARY KEY NOT NULL,
	`email` text,
	`password` text,
	`salt` text
);
