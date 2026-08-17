import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const applications = sqliteTable("applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  company: text("company").notNull(), role: text("role").notNull(),
  stage: text("stage").notNull().default("Applied"), location: text("location").notNull().default(""),
  jobUrl: text("job_url").notNull().default(""), notes: text("notes").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
