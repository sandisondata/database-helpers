import { Query } from 'database';
import { Debug, MessageType } from 'node-debug';
import { NotFoundError, ConflictError } from 'node-errors';

let debug: Debug;
const debugSource = 'database-helpers';

const findByKey = async (
  query: Query,
  tableName: string,
  key: Record<string, any>,
  forUpdate = false,
) => {
  debug = new Debug(`${debugSource}.findByKey`);
  debug.write(
    MessageType.Entry,
    `tableName=${tableName};key=${JSON.stringify(key)};forUpdate=${forUpdate}`,
  );
  const text =
    `SELECT * FROM ${tableName} ` +
    `WHERE ${Object.keys(key)
      .map((x, i) => `${x} = $${i + 1}`)
      .join(' AND ')} ` +
    `LIMIT 1${forUpdate ? ' FOR UPDATE' : ''}`;
  debug.write(MessageType.Value, `text=${text}`);
  const values = Object.values(key);
  debug.write(MessageType.Value, `values=${JSON.stringify(values)}`);
  const rows: object[] = (await query(text, values)).rows;
  debug.write(MessageType.Value, `rows=${JSON.stringify(rows)}`);
  const result = rows.length ? rows[0] : null;
  debug.write(MessageType.Exit, `result=${JSON.stringify(result)}`);
  return result;
};

export const checkPrimaryKey = async (
  query: Query,
  tableName: string,
  instanceName: string,
  primaryKey: Record<string, any>,
) => {
  const row = await findByKey(query, tableName, primaryKey);
  if (row) {
    throw new ConflictError(`${instanceName} already exists`);
  }
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
          .join(', ')}) ` +
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
          .map((x, i) => `${x} = $${Object.keys(data).length + i + 1}`)
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
