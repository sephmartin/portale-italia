import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const agentSessions = sqliteTable("agent_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  module: text("module").notNull().default("general"),
  timestamp: integer("timestamp").notNull(),
});

export const insertAgentSessionSchema = createInsertSchema(agentSessions).omit({ id: true });
export type InsertAgentSession = z.infer<typeof insertAgentSessionSchema>;
export type AgentSession = typeof agentSessions.$inferSelect;
