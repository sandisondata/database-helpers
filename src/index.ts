import { Query } from 'database';
import { NotFoundError, ConflictError } from 'node-errors';

const findByKey = async (
  query: Query,
  tableName: string,
  key: Record<string, any>,
  forUpdate = false,
) => {
  const rows: object[] = (
    await query(
      `SELECT * FROM ${tableName} ` +
        `WHERE ${Object.keys(key)
          .map((x, i) => `${x} = $${i + 1}`)
          .join(' AND ')} ` +
        `LIMIT 1${forUpdate ? ' FOR UPDATE' : ''}`,
      Object.values(key),
    )
  ).rows;
  return rows.length ? rows[0] : null;
};

export const findByPrimaryKey = async (
  query: Query,
  tableName: string,
  instanceName: string,
  primaryKey: Record<string, any>,
  forUpdate = false,
) => {
  const row = await findByKey(query, tableName, primaryKey, forUpdate);
  if (!row) {
    throw new NotFoundError(`${instanceName} not found`);
  }
  return row;
};

export const checkUniqueKey = async (
  query: Query,
  tableName: string,
  instanceName: string,
  uniqueKey: Record<string, any>,
) => {
  const row = await findByKey(query, tableName, uniqueKey);
  if (row) {
    throw new ConflictError(
      `${instanceName} ` +
        `unique key (${Object.keys(uniqueKey).join(', ')}) ` +
        `value (${Object.values(uniqueKey).join(', ')}) ` +
        'already exists',
    );
  }
};

export const findByUniqueKey = async (
  query: Query,
  tableName: string,
  instanceName: string,
  uniqueKey: Record<string, any>,
  forUpdate = false,
) => {
  const row = await findByKey(query, tableName, uniqueKey, forUpdate);
  if (!row) {
    throw new NotFoundError(
      `${instanceName} ` +
        `unique key (${Object.keys(uniqueKey).join(', ')}) ` +
        `value (${Object.values(uniqueKey).join(', ')}) ` +
        'not found',
    );
  }
  return row;
};
