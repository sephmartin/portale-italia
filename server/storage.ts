import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import type { InsertAgentSession, AgentSession } from "@shared/schema";

const sqlite = new Database("cittadino.db");
const db = drizzle(sqlite, { schema });

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS agent_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    module TEXT NOT NULL DEFAULT 'general',
    timestamp INTEGER NOT NULL
  );
`);

export interface IStorage {
  addMessage(msg: InsertAgentSession): AgentSession;
  getMessages(sessionId: string): AgentSession[];
  clearSession(sessionId: string): void;
}

export const storage: IStorage = {
  addMessage(msg) {
    return db.insert(schema.agentSessions).values(msg).returning().get();
  },
  getMessages(sessionId) {
    return db.select().from(schema.agentSessions)
      .where(eq(schema.agentSessions.sessionId, sessionId))
      .all();
  },
  clearSession(sessionId) {
    db.delete(schema.agentSessions)
      .where(eq(schema.agentSessions.sessionId, sessionId))
      .run();
  },
};
