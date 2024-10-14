import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { Database } from 'database';
import { Debug, MessageType } from 'node-debug';
import {
  checkForeignKey,
  checkPrimaryKey,
  checkUniqueKey,
  createRow,
  deleteRow,
  findByPrimaryKey,
  findByUniqueKey,
  updateRow,
} from '../dist';

describe('main', (suiteContext) => {
  Debug.initialize(true);
  let debug: Debug;
  let database: Database;
  const tableName = `_test_${Math.random().toString().substring(2)}`;
  before(async () => {
    debug = new Debug(`${suiteContext.name}.before`);
    debug.write(MessageType.Entry);
    debug.write(MessageType.Step, 'Establishing database connectivity...');
    database = Database.getInstance();
    await database.transaction(async (query) => {
      debug.write(MessageType.Step, `Creating temp table "${tableName}"...`);
      await query(
        `CREATE TABLE ${tableName} (` +
          'id serial, ' +
          'name varchar(30) NOT NULL, ' +
          'parent_id integer, ' +
          `CONSTRAINT ${tableName}_pk PRIMARY KEY (id), ` +
          `CONSTRAINT ${tableName}_uk UNIQUE (name),` +
          `CONSTRAINT ${tableName}_fk FOREIGN KEY (parent_id) REFERENCES ${tableName} (id)` +
          ')',
      );
      debug.write(
        MessageType.Step,
        `Loading data into temp table "${tableName}"...`,
      );
      await query(
        `INSERT INTO ${tableName} (name, parent_id) VALUES ` +
          "('Joe Blogs', null), " +
          "('Fred Nerks', 1) ",
      );
    });
    debug.write(MessageType.Exit);
  });
  it('checkPrimaryKey', async (testContext) => {
    debug = new Debug(`${suiteContext.name}.test.${testContext.name}`);
    debug.write(MessageType.Entry);
    //await checkPrimaryKey(database.query, tableName, { id: 1 });
    await checkPrimaryKey(database.query, tableName, { id: 0 });
    debug.write(MessageType.Exit);
    assert.ok(true);
  });
  it('checkUniqueKey', async (testContext) => {
    debug = new Debug(`${suiteContext.name}.test.${testContext.name}`);
    debug.write(MessageType.Entry);
    //await checkUniqueKey(database.query, tableName, { name: 'Joe Blogs' });
    await checkUniqueKey(database.query, tableName, { name: 'John Smith' });
    debug.write(MessageType.Exit);
    assert.ok(true);
  });
  it('checkForeignKey', async (testContext) => {
    debug = new Debug(`${suiteContext.name}.test.${testContext.name}`);
    debug.write(MessageType.Entry);
    //await checkForeignKey(database.query, tableName, { parent_id: 1 });
    await checkForeignKey(database.query, tableName, { parent_id: 0 });
    debug.write(MessageType.Exit);
    assert.ok(true);
  });
  it('findByPrimaryKey', async (testContext) => {
    debug = new Debug(`${suiteContext.name}.test.${testContext.name}`);
    debug.write(MessageType.Entry);
    //await findByPrimaryKey(database.query, tableName, { id: 0 });
    await findByPrimaryKey(database.query, tableName, { id: 1 });
    debug.write(MessageType.Exit);
    assert.ok(true);
  });
  it('findByUniqueKey', async (testContext) => {
    debug = new Debug(`${suiteContext.name}.test.${testContext.name}`);
    debug.write(MessageType.Entry);
    await findByUniqueKey(
      database.query,
      tableName,
      //{ name: 'John Smith' },
      { name: 'Joe Blogs' },
      { columnNames: ['name', 'id'] },
    );
    debug.write(MessageType.Exit);
    assert.ok(true);
  });
  it('createRow', async (testContext) => {
    debug = new Debug(`${suiteContext.name}.test.${testContext.name}`);
    debug.write(MessageType.Entry);
    await createRow(database.query, tableName, { name: 'John Smith' });
    debug.write(MessageType.Exit);
    assert.ok(true);
  });
  it('updateRow', async (testContext) => {
    debug = new Debug(`${suiteContext.name}.test.${testContext.name}`);
    debug.write(MessageType.Entry);
    await updateRow(
      database.query,
      tableName,
      { id: 3 },
      { name: 'John Smith Jr.' },
      ['name', 'id'],
    );
    debug.write(MessageType.Exit);
    assert.ok(true);
  });
  it('deleteRow', async (testContext) => {
    debug = new Debug(`${suiteContext.name}.test.${testContext.name}`);
    debug.write(MessageType.Entry);
    //await deleteRow(database.query, tableName, { id: 1 });
    await deleteRow(database.query, tableName, { id: 3 });
    debug.write(MessageType.Exit);
    assert.ok(true);
  });
  after(async () => {
    debug = new Debug(`${suiteContext.name}.after`);
    debug.write(MessageType.Entry);
    debug.write(MessageType.Step, `Dropping temp table "${tableName}"...`);
    await database.query(`DROP TABLE ${tableName}`);
    debug.write(MessageType.Step, `Disconnecting from database...`);
    await database.disconnect();
    debug.write(MessageType.Exit);
  });
});
