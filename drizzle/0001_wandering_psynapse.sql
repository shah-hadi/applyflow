CREATE TABLE `activities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_id` text NOT NULL,
	`application_id` integer NOT NULL,
	`type` text NOT NULL,
	`text` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_activities_owner_application` ON `activities` (`owner_id`,`application_id`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_applications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_id` text NOT NULL,
	`company` text NOT NULL,
	`role` text NOT NULL,
	`stage` text DEFAULT 'Applied' NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`job_url` text DEFAULT '' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`salary` text DEFAULT '' NOT NULL,
	`source` text DEFAULT '' NOT NULL,
	`contact` text DEFAULT '' NOT NULL,
	`interview_date` text DEFAULT '' NOT NULL,
	`deadline` text DEFAULT '' NOT NULL,
	`next_action` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_applications`("id", "owner_id", "company", "role", "stage", "location", "job_url", "notes", "salary", "source", "contact", "interview_date", "deadline", "next_action", "created_at", "updated_at") SELECT "id", 'legacy', "company", "role", "stage", "location", "job_url", "notes", '', '', '', '', '', '', "created_at", "created_at" FROM `applications`;--> statement-breakpoint
DROP TABLE `applications`;--> statement-breakpoint
ALTER TABLE `__new_applications` RENAME TO `applications`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_applications_owner_updated` ON `applications` (`owner_id`,`updated_at`);
