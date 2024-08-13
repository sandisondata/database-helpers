import { Query } from 'database';
import { NotFoundError, ConflictError } from 'node-errors';

export enum KeyType {
  Primary,
  Unique,
}

const _findByKey = async (
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

export const checkKey = async (
  query: Query,
  tableName: string,
  instanceName: string,
  key: Record<string, any>,
  keyType: KeyType = KeyType.Primary,
) => {
  const row = await _findByKey(query, tableName, key);
  if (row) {
    throw new ConflictError(
      `${instanceName} ` +
        (keyType == KeyType.Primary
          ? ''
          : `unique key (${Object.keys(key).join(', ')}) ` +
            `value (${Object.values(key).join(', ')}) `) +
        'already exists',
    );
  }
};

export const findByKey = async (
  query: Query,
  tableName: string,
  instanceName: string,
  key: Record<string, any>,
  keyType: KeyType = KeyType.Primary,
  forUpdate = false,
) => {
  const row = await _findByKey(query, tableName, key, forUpdate);
  if (!row) {
    throw new NotFoundError(
      `${instanceName} ` +
        (keyType == KeyType.Primary
          ? ''
          : `unique key (${Object.keys(key).join(', ')}) ` +
            `value (${Object.values(key).join(', ')}) `) +
        'not found',
    );
  }
  return row;
};

export const createRow = async (
  query: Query,
  tableName: string,
  data: Record<string, any>,
) => {
  const row = (
    await query(
      `INSERT INTO ${tableName} (${Object.keys(data).join(', ')}) ` +
        `VALUES (${Object.keys(data)
          .map((x, i) => `$${i + 1}`)
          .join(', ')} ` +
        'RETURNING *',
      Object.values(data),
    )
  ).rows[0] as object;
  return row;
};

export const updateRow = async (
  query: Query,
  tableName: string,
  primaryKey: Record<string, any>,
  data: Record<string, any>,
) => {
  const row = (
    await query(
      `UPDATE ${tableName} ` +
        `SET ${Object.keys(data)
          .map((x, i) => `${x} = $${i + 1}`)
          .join(' AND ')} ` +
        `WHERE ${Object.keys(primaryKey)
          .map((x, i) => `${x} = $${i + 1}`)
          .join(' AND ')} ` +
        'RETURNING *',
      [].concat(...Object.values(data), ...Object.values(primaryKey)),
    )
  ).rows[0] as object;
  return row;
};

export const deleteRow = async (
  query: Query,
  tableName: string,
  primaryKey: Record<string, any>,
) => {
  await query(
    `DELETE FROM ${tableName} ` +
      `WHERE ${Object.keys(primaryKey)
        .map((x, i) => `${x} = $${i + 1}`)
        .join(' AND ')}`,
    Object.values(primaryKey),
  );
};
