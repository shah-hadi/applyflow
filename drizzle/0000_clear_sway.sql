CREATE TABLE `applications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company` text NOT NULL,
	`role` text NOT NULL,
	`stage` text DEFAULT 'Applied' NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`job_url` text DEFAULT '' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
