"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRow = exports.updateRow = exports.createRow = exports.findByUniqueKey = exports.findByPrimaryKey = exports.checkUniqueKey = exports.checkPrimaryKey = void 0;
const node_debug_1 = require("node-debug");
const node_errors_1 = require("node-errors");
let debug;
const debugSource = 'database-helpers';
const findByKey = (query_1, tableName_1, key_1, ...args_1) => __awaiter(void 0, [query_1, tableName_1, key_1, ...args_1], void 0, function* (query, tableName, key, forUpdate = false) {
    debug = new node_debug_1.Debug(`${debugSource}.findByKey`);
    debug.write(node_debug_1.MessageType.Entry, `tableName=${tableName};` +
        `key=${JSON.stringify(key)};` +
        `forUpdate=${forUpdate}`);
    const text = `SELECT * FROM ${tableName} ` +
        `WHERE ${Object.keys(key)
            .map((x, i) => `${x} = $${i + 1}`)
            .join(' AND ')} ` +
        `LIMIT 1${forUpdate ? ' FOR UPDATE' : ''}`;
    debug.write(node_debug_1.MessageType.Value, `text=${text}`);
    const values = Object.values(key);
    debug.write(node_debug_1.MessageType.Value, `values=${JSON.stringify(values)}`);
    debug.write(node_debug_1.MessageType.Step, 'Finding row...');
    const row = (yield query(text, values)).rows[0] || null;
    debug.write(node_debug_1.MessageType.Exit, `row=${JSON.stringify(row)}`);
    return row;
});
const checkPrimaryKey = (query, tableName, instanceName, primaryKey) => __awaiter(void 0, void 0, void 0, function* () {
    debug = new node_debug_1.Debug(`${debugSource}.checkPrimaryKey`);
    debug.write(node_debug_1.MessageType.Entry, `tableName=${tableName};` +
        `instanceName=${instanceName};` +
        `primaryKey=${JSON.stringify(primaryKey)}`);
    debug.write(node_debug_1.MessageType.Step, 'Finding row by key...');
    const row = yield findByKey(query, tableName, primaryKey);
    debug.write(node_debug_1.MessageType.Value, `row=${JSON.stringify(row)}`);
    if (row) {
        throw new node_errors_1.ConflictError(`${instanceName} already exists`);
    }
    debug.write(node_debug_1.MessageType.Exit);
});
exports.checkPrimaryKey = checkPrimaryKey;
const checkUniqueKey = (query, tableName, instanceName, uniqueKey) => __awaiter(void 0, void 0, void 0, function* () {
    debug = new node_debug_1.Debug(`${debugSource}.checkUniqueKey`);
    debug.write(node_debug_1.MessageType.Entry, `tableName=${tableName};` +
        `instanceName=${instanceName};` +
        `uniqueKey=${JSON.stringify(uniqueKey)};`);
    debug.write(node_debug_1.MessageType.Step, 'Finding row by key...');
    const row = yield findByKey(query, tableName, uniqueKey);
    debug.write(node_debug_1.MessageType.Value, `row=${JSON.stringify(row)}`);
    if (row) {
        throw new node_errors_1.ConflictError(`${instanceName} ` +
            `unique key (${Object.keys(uniqueKey).join(', ')}) ` +
            `value (${Object.values(uniqueKey).join(', ')}) ` +
            'already exists');
    }
    debug.write(node_debug_1.MessageType.Exit);
});
exports.checkUniqueKey = checkUniqueKey;
const findByPrimaryKey = (query_1, tableName_1, instanceName_1, primaryKey_1, ...args_1) => __awaiter(void 0, [query_1, tableName_1, instanceName_1, primaryKey_1, ...args_1], void 0, function* (query, tableName, instanceName, primaryKey, forUpdate = false) {
    debug = new node_debug_1.Debug(`${debugSource}.findByPrimaryKey`);
    debug.write(node_debug_1.MessageType.Entry, `tableName=${tableName};` +
        `instanceName=${instanceName};` +
        `primaryKey=${JSON.stringify(primaryKey)};` +
        `forUpdate=${forUpdate}`);
    debug.write(node_debug_1.MessageType.Step, 'Finding row by key...');
    const row = yield findByKey(query, tableName, primaryKey, forUpdate);
    debug.write(node_debug_1.MessageType.Value, `row=${JSON.stringify(row)}`);
    if (!row) {
        throw new node_errors_1.NotFoundError(`${instanceName} not found`);
    }
    debug.write(node_debug_1.MessageType.Exit, `row=${JSON.stringify(row)}`);
    return row;
});
exports.findByPrimaryKey = findByPrimaryKey;
const findByUniqueKey = (query_1, tableName_1, instanceName_1, uniqueKey_1, ...args_1) => __awaiter(void 0, [query_1, tableName_1, instanceName_1, uniqueKey_1, ...args_1], void 0, function* (query, tableName, instanceName, uniqueKey, forUpdate = false) {
    debug = new node_debug_1.Debug(`${debugSource}.findByUniqueKey`);
    debug.write(node_debug_1.MessageType.Entry, `tableName=${tableName};` +
        `instanceName=${instanceName};` +
        `uniqueKey=${JSON.stringify(uniqueKey)};` +
        `forUpdate=${forUpdate}`);
    debug.write(node_debug_1.MessageType.Step, 'Finding row by key...');
    const row = yield findByKey(query, tableName, uniqueKey, forUpdate);
    debug.write(node_debug_1.MessageType.Value, `row=${JSON.stringify(row)}`);
    if (!row) {
        throw new node_errors_1.NotFoundError(`${instanceName} ` +
            `unique key (${Object.keys(uniqueKey).join(', ')}) ` +
            `value (${Object.values(uniqueKey).join(', ')}) ` +
            'not found');
    }
    debug.write(node_debug_1.MessageType.Exit, `row=${JSON.stringify(row)}`);
    return row;
});
exports.findByUniqueKey = findByUniqueKey;
const createRow = (query, tableName, data) => __awaiter(void 0, void 0, void 0, function* () {
    debug = new node_debug_1.Debug(`${debugSource}.createRow`);
    debug.write(node_debug_1.MessageType.Entry, `tableName=${tableName};data=${JSON.stringify(data)}`);
    const text = `INSERT INTO ${tableName} (${Object.keys(data).join(', ')}) ` +
        `VALUES (${Object.keys(data)
            .map((x, i) => `$${i + 1}`)
            .join(', ')}) ` +
        'RETURNING *';
    debug.write(node_debug_1.MessageType.Value, `text=${text}`);
    const values = Object.values(data);
    debug.write(node_debug_1.MessageType.Value, `values=${JSON.stringify(values)}`);
    debug.write(node_debug_1.MessageType.Step, 'Creating row...');
    const row = (yield query(text, values)).rows[0];
    debug.write(node_debug_1.MessageType.Exit, `row=${JSON.stringify(row)}`);
    return row;
});
exports.createRow = createRow;
const updateRow = (query, tableName, primaryKey, data) => __awaiter(void 0, void 0, void 0, function* () {
    debug = new node_debug_1.Debug(`${debugSource}.updateRow`);
    debug.write(node_debug_1.MessageType.Entry, `tableName=${tableName};` +
        `primaryKey=${JSON.stringify(primaryKey)};` +
        `data=${JSON.stringify(data)}`);
    const text = `UPDATE ${tableName} ` +
        `SET ${Object.keys(data)
            .map((x, i) => `${x} = $${i + 1}`)
            .join(' AND ')} ` +
        `WHERE ${Object.keys(primaryKey)
            .map((x, i) => `${x} = $${Object.keys(data).length + i + 1}`)
            .join(' AND ')} ` +
        'RETURNING *';
    debug.write(node_debug_1.MessageType.Value, `text=${text}`);
    const values = [].concat(...Object.values(data), ...Object.values(primaryKey));
    debug.write(node_debug_1.MessageType.Value, `values=${JSON.stringify(values)}`);
    debug.write(node_debug_1.MessageType.Step, 'Updating row...');
    const row = (yield query(text, values)).rows[0];
    debug.write(node_debug_1.MessageType.Exit, `row=${JSON.stringify(row)}`);
    return row;
});
exports.updateRow = updateRow;
const deleteRow = (query, tableName, primaryKey) => __awaiter(void 0, void 0, void 0, function* () {
    debug = new node_debug_1.Debug(`${debugSource}.deleteRow`);
    debug.write(node_debug_1.MessageType.Entry, `tableName=${tableName};primaryKey=${JSON.stringify(primaryKey)}`);
    const text = `DELETE FROM ${tableName} ` +
        `WHERE ${Object.keys(primaryKey)
            .map((x, i) => `${x} = $${i + 1}`)
            .join(' AND ')}`;
    debug.write(node_debug_1.MessageType.Value, `text=${text}`);
    const values = Object.values(primaryKey);
    debug.write(node_debug_1.MessageType.Value, `values=${JSON.stringify(values)}`);
    debug.write(node_debug_1.MessageType.Step, 'Deleting row...');
    yield query(text, values);
    debug.write(node_debug_1.MessageType.Exit);
});
exports.deleteRow = deleteRow;
