import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const applications = sqliteTable("applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerId: text("owner_id").notNull(), company: text("company").notNull(), role: text("role").notNull(),
  stage: text("stage").notNull().default("Applied"), location: text("location").notNull().default(""),
  jobUrl: text("job_url").notNull().default(""), notes: text("notes").notNull().default(""),
  salary: text("salary").notNull().default(""), source: text("source").notNull().default(""),
  contact: text("contact").notNull().default(""), interviewDate: text("interview_date").notNull().default(""),
  deadline: text("deadline").notNull().default(""), nextAction: text("next_action").notNull().default(""),
  createdAt: text("created_at").notNull(), updatedAt: text("updated_at").notNull(),
}, (table) => [index("idx_applications_owner_updated").on(table.ownerId, table.updatedAt)]);
export const activities = sqliteTable("activities", {
  id: integer("id").primaryKey({ autoIncrement: true }), ownerId: text("owner_id").notNull(),
  applicationId: integer("application_id").notNull(), type: text("type").notNull(),
  text: text("text").notNull(), createdAt: text("created_at").notNull(),
}, (table) => [index("idx_activities_owner_application").on(table.ownerId, table.applicationId)]);
