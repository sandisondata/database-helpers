import { Query } from 'database';
import { Debug, MessageType } from 'node-debug';
import { NotFoundError, ConflictError } from 'node-errors';

const debugSource = 'database-helpers';

const findByKey = async (
  query: Query,
  tableName: string,
  key: Record<string, any>,
  forUpdate = false,
) => {
  const debug = new Debug(`${debugSource}.findByKey`);
  debug.write(
    MessageType.Entry,
    `tableName=${tableName};` +
      `key=${JSON.stringify(key)};` +
      `forUpdate=${forUpdate}`,
  );
  const text =
    `SELECT * FROM ${tableName} ` +
    `WHERE ${Object.keys(key)
      .map(
        (x, i) =>
          `${x} ` + (Object.values(key)[i] == null ? 'IS NULL' : `= $${i + 1}`),
      )
      .join(' AND ')} ` +
    `LIMIT 1${forUpdate ? ' FOR UPDATE' : ''}`;
  debug.write(MessageType.Value, `text=(${text})`);
  const values = Object.values(key);
  debug.write(MessageType.Value, `values=${JSON.stringify(values)}`);
  debug.write(MessageType.Step, 'Finding row...');
  const row: object | null = (await query(text, values)).rows[0] || null;
  debug.write(MessageType.Exit, `row=${JSON.stringify(row)}`);
  return row;
};

export const checkPrimaryKey = async (
  query: Query,
  tableName: string,
  instanceName: string,
  primaryKey: Record<string, any>,
) => {
  const debug = new Debug(`${debugSource}.checkPrimaryKey`);
  debug.write(
    MessageType.Entry,
    `tableName=${tableName};` +
      `instanceName=${instanceName};` +
      `primaryKey=${JSON.stringify(primaryKey)}`,
  );
  debug.write(MessageType.Step, 'Finding row by key...');
  const row = await findByKey(query, tableName, primaryKey);
  debug.write(MessageType.Value, `row=${JSON.stringify(row)}`);
  if (row) {
    throw new ConflictError(`${instanceName} already exists`);
  }
  debug.write(MessageType.Exit);
};

export const checkUniqueKey = async (
  query: Query,
  tableName: string,
  instanceName: string,
  uniqueKey: Record<string, any>,
) => {
  const debug = new Debug(`${debugSource}.checkUniqueKey`);
  debug.write(
    MessageType.Entry,
    `tableName=${tableName};` +
      `instanceName=${instanceName};` +
      `uniqueKey=${JSON.stringify(uniqueKey)};`,
  );
  debug.write(MessageType.Step, 'Finding row by key...');
  const row = await findByKey(query, tableName, uniqueKey);
  debug.write(MessageType.Value, `row=${JSON.stringify(row)}`);
  if (row) {
    throw new ConflictError(
      `${instanceName} ` +
        `unique key (${Object.keys(uniqueKey).join(', ')}) ` +
        `value (${Object.values(uniqueKey).join(', ')}) ` +
        'already exists',
    );
  }
  debug.write(MessageType.Exit);
};

export const findByPrimaryKey = async (
  query: Query,
  tableName: string,
  instanceName: string,
  primaryKey: Record<string, any>,
  forUpdate = false,
) => {
  const debug = new Debug(`${debugSource}.findByPrimaryKey`);
  debug.write(
    MessageType.Entry,
    `tableName=${tableName};` +
      `instanceName=${instanceName};` +
      `primaryKey=${JSON.stringify(primaryKey)};` +
      `forUpdate=${forUpdate}`,
  );
  debug.write(MessageType.Step, 'Finding row by key...');
  const row = await findByKey(query, tableName, primaryKey, forUpdate);
  debug.write(MessageType.Value, `row=${JSON.stringify(row)}`);
  if (!row) {
    throw new NotFoundError(`${instanceName} not found`);
  }
  debug.write(MessageType.Exit, `row=${JSON.stringify(row)}`);
  return row;
};

export const findByUniqueKey = async (
  query: Query,
  tableName: string,
  instanceName: string,
  uniqueKey: Record<string, any>,
  forUpdate = false,
) => {
  const debug = new Debug(`${debugSource}.findByUniqueKey`);
  debug.write(
    MessageType.Entry,
    `tableName=${tableName};` +
      `instanceName=${instanceName};` +
      `uniqueKey=${JSON.stringify(uniqueKey)};` +
      `forUpdate=${forUpdate}`,
  );
  debug.write(MessageType.Step, 'Finding row by key...');
  const row = await findByKey(query, tableName, uniqueKey, forUpdate);
  debug.write(MessageType.Value, `row=${JSON.stringify(row)}`);
  if (!row) {
    throw new NotFoundError(
      `${instanceName} ` +
        `unique key (${Object.keys(uniqueKey).join(', ')}) ` +
        `value (${Object.values(uniqueKey).join(', ')}) ` +
        'not found',
    );
  }
  debug.write(MessageType.Exit, `row=${JSON.stringify(row)}`);
  return row;
};

export const createRow = async (
  query: Query,
  tableName: string,
  data: Record<string, any>,
) => {
  const debug = new Debug(`${debugSource}.createRow`);
  debug.write(
    MessageType.Entry,
    `tableName=${tableName};data=${JSON.stringify(data)}`,
  );
  const text =
    `INSERT INTO ${tableName} (${Object.keys(data).join(', ')}) ` +
    `VALUES (${Object.keys(data)
      .map((x, i) => `$${i + 1}`)
      .join(', ')}) ` +
    'RETURNING *';
  debug.write(MessageType.Value, `text=(${text})`);
  const values = Object.values(data);
  debug.write(MessageType.Value, `values=${JSON.stringify(values)}`);
  debug.write(MessageType.Step, 'Creating row...');
  const row = (await query(text, values)).rows[0] as object;
  debug.write(MessageType.Exit, `row=${JSON.stringify(row)}`);
  return row;
};

export const updateRow = async (
  query: Query,
  tableName: string,
  primaryKey: Record<string, any>,
  data: Record<string, any>,
) => {
  const debug = new Debug(`${debugSource}.updateRow`);
  debug.write(
    MessageType.Entry,
    `tableName=${tableName};` +
      `primaryKey=${JSON.stringify(primaryKey)};` +
      `data=${JSON.stringify(data)}`,
  );
  const text =
    `UPDATE ${tableName} ` +
    `SET ${Object.keys(data)
      .map((x, i) => `${x} = $${i + 1}`)
      .join(' AND ')} ` +
    `WHERE ${Object.keys(primaryKey)
      .map((x, i) => `${x} = $${Object.keys(data).length + i + 1}`)
      .join(' AND ')} ` +
    'RETURNING *';
  debug.write(MessageType.Value, `text=(${text})`);
  const values = [].concat(
    ...Object.values(data),
    ...Object.values(primaryKey),
  );
  debug.write(MessageType.Value, `values=${JSON.stringify(values)}`);
  debug.write(MessageType.Step, 'Updating row...');
  const row = (await query(text, values)).rows[0] as object;
  debug.write(MessageType.Exit, `row=${JSON.stringify(row)}`);
  return row;
};

export const deleteRow = async (
  query: Query,
  tableName: string,
  primaryKey: Record<string, any>,
) => {
  const debug = new Debug(`${debugSource}.deleteRow`);
  debug.write(
    MessageType.Entry,
    `tableName=${tableName};primaryKey=${JSON.stringify(primaryKey)}`,
  );
  const text =
    `DELETE FROM ${tableName} ` +
    `WHERE ${Object.keys(primaryKey)
      .map((x, i) => `${x} = $${i + 1}`)
      .join(' AND ')}`;
  debug.write(MessageType.Value, `text=(${text})`);
  const values = Object.values(primaryKey);
  debug.write(MessageType.Value, `values=${JSON.stringify(values)}`);
  debug.write(MessageType.Step, 'Deleting row...');
  await query(text, values);
  debug.write(MessageType.Exit);
};
