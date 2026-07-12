import { DatabaseError } from './errors';

export async function query<T>(
  db: D1Database,
  sql: string,
  ...params: unknown[]
): Promise<T[]> {
  try {
    const stmt = db.prepare(sql);
    const result = await (params.length > 0 ? stmt.bind(...params) : stmt).all<T>();
    return result.results ?? [];
  } catch (err) {
    console.error(`[DB] Query failed: ${sql.substring(0, 80)}...`, err);
    throw new DatabaseError('Database query failed', {
      sql: sql.substring(0, 120),
    });
  }
}

export async function first<T>(
  db: D1Database,
  sql: string,
  ...params: unknown[]
): Promise<T | null> {
  try {
    const stmt = db.prepare(sql);
    const result = await (params.length > 0 ? stmt.bind(...params) : stmt).first<T>();
    return result ?? null;
  } catch (err) {
    console.error(`[DB] First query failed: ${sql.substring(0, 80)}...`, err);
    throw new DatabaseError('Database query failed', {
      sql: sql.substring(0, 120),
    });
  }
}

export async function run(
  db: D1Database,
  sql: string,
  ...params: unknown[]
): Promise<D1Result> {
  try {
    const stmt = db.prepare(sql);
    return await (params.length > 0 ? stmt.bind(...params) : stmt).run();
  } catch (err) {
    console.error(`[DB] Run failed: ${sql.substring(0, 80)}...`, err);
    throw new DatabaseError('Database write failed', {
      sql: sql.substring(0, 120),
    });
  }
}
