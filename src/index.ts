import { Query } from 'database';
import { Debug, MessageType } from 'node-debug';
import { NotFoundError, ConflictError } from 'node-errors';

const debugSource = 'database-helpers';

interface Options {
  columnNames?: string[];
  forUpdate?: boolean;
}

const findByKey = async <
  T extends boolean | Options,
  R = T extends true | Options ? object | null : number,
>(
  query: Query,
  tableName: string,
  key: Record<string, string | number | boolean | null>,
  isUnique: T | (T extends true | Options ? Options : never),
): Promise<R> => {
  const debug = new Debug(`${debugSource}.findByKey`);
  debug.write(
    MessageType.Entry,
    `tableName=${tableName};` +
      `key=${JSON.stringify(key)};` +
      `isUnique=${JSON.stringify(isUnique)}`,
  );
  const text =
    `SELECT ${
      typeof isUnique !== 'boolean' &&
      typeof isUnique.columnNames !== 'undefined'
        ? isUnique.columnNames.join(', ')
        : '*'
    } ` +
    `FROM ${tableName} ` +
    `WHERE ${Object.keys(key)
      .map(
        (x, i) =>
          `${x} ` + (key[x] == null ? 'IS NULL AND 1 ' : '') + `= $${i + 1}`,
      )
      .join(' AND ')}` +
    ((typeof isUnique !== 'boolean' && isUnique.forUpdate) || false
      ? ' FOR UPDATE'
      : '');
  debug.write(MessageType.Value, `text=(${text})`);
  const values = Object.values(key).map((x) => (x == null ? 1 : x));
  debug.write(MessageType.Value, `values=${JSON.stringify(values)}`);
  if (typeof isUnique !== 'boolean' || isUnique) {
    debug.write(MessageType.Step, 'Finding row...');
    const row: object | null = (await query(text, values)).rows[0] || null;
    debug.write(MessageType.Exit, `row=${JSON.stringify(row)}`);
    return row as R;
  } else {
    debug.write(MessageType.Step, 'Finding row count...');
    const rowCount = (await query(text, values)).rowCount || 0;
    debug.write(MessageType.Exit, `rowCount=${rowCount}`);
    return rowCount as R;
  }
};

export const checkPrimaryKey = async (
  query: Query,
  tableName: string,
  primaryKey: Record<string, string | number>,
) => {
  const debug = new Debug(`${debugSource}.checkPrimaryKey`);
  debug.write(
    MessageType.Entry,
    `tableName=${tableName};primaryKey=${JSON.stringify(primaryKey)}`,
  );
  debug.write(MessageType.Step, 'Finding row by key...');
  const row = await findByKey(query, tableName, primaryKey, true);
  debug.write(MessageType.Value, `row=${JSON.stringify(row)}`);
  if (row) {
    throw new ConflictError(`Table (${tableName}) row already exists`);
  }
  debug.write(MessageType.Exit);
};

export const findByPrimaryKey = async (
  query: Query,
  tableName: string,
  primaryKey: Record<string, string | number>,
  options?: Options,
) => {
  const debug = new Debug(`${debugSource}.findByPrimaryKey`);
  debug.write(
    MessageType.Entry,
    `tableName=${tableName};primaryKey=${JSON.stringify(primaryKey)}` +
      (typeof options !== 'undefined'
        ? `;options=${JSON.stringify(options)}`
        : ''),
  );
  debug.write(MessageType.Step, 'Finding row by key...');
  const row = await findByKey(query, tableName, primaryKey, options || true);
  if (!row) {
    throw new NotFoundError(`Table (${tableName}) row not found`);
  }
  debug.write(MessageType.Exit, `row=${JSON.stringify(row)}`);
  return row;
};

export const checkUniqueKey = async (
  query: Query,
  tableName: string,
  uniqueKey: Record<string, string | number | boolean | null>,
) => {
  const debug = new Debug(`${debugSource}.checkUniqueKey`);
  debug.write(
    MessageType.Entry,
    `tableName=${tableName};uniqueKey=${JSON.stringify(uniqueKey)};`,
  );
  debug.write(MessageType.Step, 'Finding row by key...');
  const row = await findByKey(query, tableName, uniqueKey, true);
  debug.write(MessageType.Value, `row=${JSON.stringify(row)}`);
  if (row) {
    throw new ConflictError(
      `Table (${tableName}) row with ` +
        `unique key (${Object.keys(uniqueKey).join(', ')}) ` +
        `value (${Object.values(uniqueKey)
          .map((x) =>
            typeof x == 'string' ? `"${x}"` : x == null ? 'null' : x,
          )
          .join(', ')}) ` +
        'already exists',
    );
  }
  debug.write(MessageType.Exit);
};

export const findByUniqueKey = async (
  query: Query,
  tableName: string,
  uniqueKey: Record<string, string | number | boolean | null>,
  options?: Options,
) => {
  const debug = new Debug(`${debugSource}.findByUniqueKey`);
  debug.write(
    MessageType.Entry,
    `tableName=${tableName};uniqueKey=${JSON.stringify(uniqueKey)}` +
      (typeof options !== 'undefined'
        ? `;options=${JSON.stringify(options)}`
        : ''),
  );
  debug.write(MessageType.Step, 'Finding row by key...');
  const row = await findByKey(query, tableName, uniqueKey, options || true);
  if (!row) {
    throw new NotFoundError(
      `Table (${tableName}) row with ` +
        `unique key (${Object.keys(uniqueKey).join(', ')}) ` +
        `value (${Object.values(uniqueKey)
          .map((x) =>
            typeof x == 'string' ? `"${x}"` : x == null ? 'null' : x,
          )
          .join(', ')}) ` +
        'not found',
    );
  }
  debug.write(MessageType.Exit, `row=${JSON.stringify(row)}`);
  return row;
};

export const checkForeignKey = async (
  query: Query,
  tableName: string,
  foreignKey: Record<string, string | number>,
) => {
  const debug = new Debug(`${debugSource}.checkForeignKey`);
  debug.write(
    MessageType.Entry,
    `tableName=${tableName};foreignKey=${JSON.stringify(foreignKey)};`,
  );
  debug.write(MessageType.Step, 'Finding row count by key...');
  const rowCount = await findByKey(query, tableName, foreignKey, false);
  debug.write(MessageType.Value, `rowCount=${rowCount}`);
  if (rowCount) {
    throw new ConflictError(
      `Table (${tableName}) row${rowCount == 1 ? '' : `s (${rowCount})`} with ` +
        `foreign key (${Object.keys(foreignKey).join(', ')}) ` +
        `value (${Object.values(foreignKey)
          .map((x) =>
            typeof x == 'string' ? `"${x}"` : x == null ? 'null' : x,
          )
          .join(', ')}) ` +
        `exist${rowCount == 1 ? 's' : ''}`,
    );
  }
  debug.write(MessageType.Exit);
};

export const createRow = async (
  query: Query,
  tableName: string,
  data: Record<string, any>,
  returningColumnNames?: string[],
) => {
  const debug = new Debug(`${debugSource}.createRow`);
  debug.write(
    MessageType.Entry,
    `tableName=${tableName};` +
      `data=${JSON.stringify(data)}` +
      (typeof returningColumnNames !== 'undefined'
        ? `;returningColumnNames=${JSON.stringify(returningColumnNames)}`
        : ''),
  );
  const text =
    `INSERT INTO ${tableName} ` +
    (Object.keys(data).length ? `(${Object.keys(data).join(', ')}) ` : '') +
    'VALUES (' +
    (Object.keys(data).length
      ? `${Object.keys(data)
          .map((x, i) => `$${i + 1}`)
          .join(', ')}`
      : 'default') +
    `) RETURNING ${
      typeof returningColumnNames !== 'undefined'
        ? returningColumnNames.join(', ')
        : '*'
    }`;
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
  primaryKey: Record<string, string | number>,
  data: Record<string, any>,
  returningColumnNames?: string[],
) => {
  const debug = new Debug(`${debugSource}.updateRow`);
  debug.write(
    MessageType.Entry,
    `tableName=${tableName};` +
      `primaryKey=${JSON.stringify(primaryKey)};` +
      `data=${JSON.stringify(data)}` +
      (typeof returningColumnNames !== 'undefined'
        ? `;returningColumnNames=${JSON.stringify(returningColumnNames)}`
        : ''),
  );
  const text =
    `UPDATE ${tableName} ` +
    `SET ${Object.keys(data)
      .map((x, i) => `${x} = $${i + 1}`)
      .join(', ')} ` +
    `WHERE ${Object.keys(primaryKey)
      .map((x, i) => `${x} = $${Object.keys(data).length + i + 1}`)
      .join(' AND ')} ` +
    `RETURNING ${
      typeof returningColumnNames !== 'undefined'
        ? returningColumnNames.join(', ')
        : '*'
    }`;
  debug.write(MessageType.Value, `text=(${text})`);
  const values = [...Object.values(data), ...Object.values(primaryKey)];
  debug.write(MessageType.Value, `values=${JSON.stringify(values)}`);
  debug.write(MessageType.Step, 'Updating row...');
  const row = (await query(text, values)).rows[0] as object;
  debug.write(MessageType.Exit, `row=${JSON.stringify(row)}`);
  return row;
};

export const deleteRow = async (
  query: Query,
  tableName: string,
  primaryKey: Record<string, string | number>,
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
