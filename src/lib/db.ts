import { DatabaseSync } from "node:sqlite";
import path from "path";
import fs from "fs";

function getDbPath(): string {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && envUrl.startsWith("file:")) {
    const rawPath = envUrl.replace("file:", "");
    return path.isAbsolute(rawPath) ? rawPath : path.resolve(/*turbopackIgnore: true*/ process.cwd(), rawPath);
  }
  return path.resolve(/*turbopackIgnore: true*/ process.cwd(), "db", "custom.db");
}

export interface RPSRecord {
  id: string;
  mataKuliah: string;
  sks: string;
  semester: string;
  programStudi: string;
  deskripsi: string | null;
  promptText: string;
  jsonData: string;
  tags: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "PUBLISHED";
  createdAt: string;
  updatedAt: string;
}

class SQLiteDB {
  private db: DatabaseSync;

  constructor() {
    const dbPath = getDbPath();
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.db = new DatabaseSync(dbPath);
    this.initTables();
  }

  private initTables() {
    try {
      this.db.exec("PRAGMA journal_mode = WAL;");
      this.db.exec("PRAGMA busy_timeout = 5000;");
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS RPS (
          id TEXT PRIMARY KEY,
          mataKuliah TEXT NOT NULL,
          sks TEXT NOT NULL,
          semester TEXT NOT NULL,
          programStudi TEXT NOT NULL,
          deskripsi TEXT,
          promptText TEXT NOT NULL,
          jsonData TEXT NOT NULL,
          tags TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL DEFAULT 'DRAFT',
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_rps_mataKuliah ON RPS(mataKuliah);
        CREATE INDEX IF NOT EXISTS idx_rps_programStudi ON RPS(programStudi);
      `);
      // Add status column if existing table lacks it
      try {
        this.db.exec("ALTER TABLE RPS ADD COLUMN status TEXT NOT NULL DEFAULT 'DRAFT';");
      } catch {
        // Column already exists
      }
    } catch {
      // Ignore concurrency initialization locks across build worker threads
    }
  }

  private formatRow(row: any): RPSRecord | null {
    if (!row) return null;
    return {
      id: String(row.id),
      mataKuliah: String(row.mataKuliah),
      sks: String(row.sks),
      semester: String(row.semester),
      programStudi: String(row.programStudi),
      deskripsi: row.deskripsi ? String(row.deskripsi) : null,
      promptText: String(row.promptText),
      jsonData: String(row.jsonData),
      tags: String(row.tags || ""),
      status: (row.status as any) || "DRAFT",
      createdAt: String(row.createdAt),
      updatedAt: String(row.updatedAt),
    };
  }

  public rPS = {
    findMany: async (options?: {
      orderBy?: { createdAt?: "asc" | "desc" };
      select?: Record<string, boolean>;
      where?: { id?: { in?: string[] } };
    }): Promise<RPSRecord[]> => {
      let query = "SELECT * FROM RPS";
      const params: any[] = [];

      if (options?.where?.id?.in && options.where.id.in.length > 0) {
        const placeholders = options.where.id.in.map(() => "?").join(",");
        query += ` WHERE id IN (${placeholders})`;
        params.push(...options.where.id.in);
      }

      if (options?.orderBy?.createdAt) {
        query += ` ORDER BY createdAt ${options.orderBy.createdAt.toUpperCase()}`;
      } else {
        query += " ORDER BY createdAt DESC";
      }

      const stmt = this.db.prepare(query);
      const rows = stmt.all(...params) as any[];
      return rows.map((r) => this.formatRow(r)!).filter(Boolean);
    },

    findUnique: async (options: { where: { id: string } }): Promise<RPSRecord | null> => {
      const stmt = this.db.prepare("SELECT * FROM RPS WHERE id = ?");
      const row = stmt.get(options.where.id);
      return this.formatRow(row);
    },

    create: async (options: {
      data: {
        id?: string;
        mataKuliah: string;
        sks: string;
        semester: string;
        programStudi: string;
        deskripsi?: string | null;
        promptText: string;
        jsonData: string;
        tags?: string;
        status?: string;
      };
    }): Promise<RPSRecord> => {
      const { data } = options;
      const id =
        data.id ||
        `rps_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const now = new Date().toISOString();
      const deskripsi = data.deskripsi ?? null;
      const tags = data.tags ?? "";
      const status = data.status ?? "DRAFT";

      const stmt = this.db.prepare(`
        INSERT INTO RPS (id, mataKuliah, sks, semester, programStudi, deskripsi, promptText, jsonData, tags, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        data.mataKuliah,
        data.sks,
        data.semester,
        data.programStudi,
        deskripsi,
        data.promptText,
        data.jsonData,
        tags,
        status,
        now,
        now
      );

      const created = await this.rPS.findUnique({ where: { id } });
      if (!created) {
        throw new Error("Gagal membuat data RPS.");
      }
      return created;
    },

    update: async (options: {
      where: { id: string };
      data: Record<string, any>;
    }): Promise<RPSRecord> => {
      const { id } = options.where;
      const existing = await this.rPS.findUnique({ where: { id } });
      if (!existing) {
        throw new Error(`RPS record with id ${id} not found.`);
      }

      const updates: string[] = [];
      const params: any[] = [];
      const fields = [
        "mataKuliah",
        "sks",
        "semester",
        "programStudi",
        "deskripsi",
        "promptText",
        "jsonData",
        "tags",
        "status",
      ];

      for (const field of fields) {
        if (options.data[field] !== undefined) {
          updates.push(`${field} = ?`);
          params.push(options.data[field]);
        }
      }

      if (updates.length > 0) {
        const now = new Date().toISOString();
        updates.push("updatedAt = ?");
        params.push(now);

        params.push(id);

        const query = `UPDATE RPS SET ${updates.join(", ")} WHERE id = ?`;
        const stmt = this.db.prepare(query);
        stmt.run(...params);
      }

      const updated = await this.rPS.findUnique({ where: { id } });
      return updated!;
    },

    delete: async (options: { where: { id: string } }): Promise<RPSRecord | null> => {
      const { id } = options.where;
      const existing = await this.rPS.findUnique({ where: { id } });
      if (existing) {
        const stmt = this.db.prepare("DELETE FROM RPS WHERE id = ?");
        stmt.run(id);
      }
      return existing;
    },

    deleteMany: async (options: { where: { id?: { in?: string[] } } }): Promise<{ count: number }> => {
      const ids = options?.where?.id?.in;
      if (!ids || ids.length === 0) {
        return { count: 0 };
      }
      const placeholders = ids.map(() => "?").join(",");
      const stmt = this.db.prepare(`DELETE FROM RPS WHERE id IN (${placeholders})`);
      const info = stmt.run(...ids) as { changes?: number };
      return { count: info.changes ?? ids.length };
    },
  };
}

const globalForDB = globalThis as unknown as {
  sqliteDb: SQLiteDB | undefined;
};

export const db = globalForDB.sqliteDb ?? new SQLiteDB();

if (process.env.NODE_ENV !== "production") {
  globalForDB.sqliteDb = db;
}
