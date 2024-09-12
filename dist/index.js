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
exports.deleteRow = exports.updateRow = exports.createRow = exports.findByUniqueKey = exports.findByPrimaryKey = exports.checkForeignKey = exports.checkUniqueKey = exports.checkPrimaryKey = void 0;
const node_debug_1 = require("node-debug");
const node_errors_1 = require("node-errors");
const debugSource = 'database-helpers';
const findByKey = (query, tableName, key, isUnique) => __awaiter(void 0, void 0, void 0, function* () {
    const debug = new node_debug_1.Debug(`${debugSource}.findByKey`);
    debug.write(node_debug_1.MessageType.Entry, `tableName=${tableName};` +
        `key=${JSON.stringify(key)};` +
        `isUnique=${JSON.stringify(isUnique)}`);
    const text = `SELECT ${typeof isUnique !== 'boolean' &&
        typeof isUnique.columnNames !== 'undefined'
        ? isUnique.columnNames.join(', ')
        : '*'} ` +
        `FROM ${tableName} ` +
        `WHERE ${Object.keys(key)
            .map((x, i) => `${x} ` + (key[x] == null ? 'IS NULL AND 1 ' : '') + `= $${i + 1}`)
            .join(' AND ')}` +
        ((typeof isUnique !== 'boolean' && isUnique.forUpdate) || false
            ? ' FOR UPDATE'
            : '');
    debug.write(node_debug_1.MessageType.Value, `text=(${text})`);
    const values = Object.values(key).map((x) => (x == null ? 1 : x));
    debug.write(node_debug_1.MessageType.Value, `values=${JSON.stringify(values)}`);
    if (typeof isUnique !== 'boolean' || isUnique) {
        debug.write(node_debug_1.MessageType.Step, 'Finding row...');
        const row = (yield query(text, values)).rows[0] || null;
        debug.write(node_debug_1.MessageType.Exit, `row=${JSON.stringify(row)}`);
        return row;
    }
    else {
        debug.write(node_debug_1.MessageType.Step, 'Finding row count...');
        const rowCount = (yield query(text, values)).rowCount || 0;
        debug.write(node_debug_1.MessageType.Exit, `rowCount=${rowCount}`);
        return rowCount;
    }
});
const checkPrimaryKey = (query, tableName, primaryKey) => __awaiter(void 0, void 0, void 0, function* () {
    const debug = new node_debug_1.Debug(`${debugSource}.checkPrimaryKey`);
    debug.write(node_debug_1.MessageType.Entry, `tableName=${tableName};primaryKey=${JSON.stringify(primaryKey)}`);
    debug.write(node_debug_1.MessageType.Step, 'Finding row by key...');
    const row = yield findByKey(query, tableName, primaryKey, true);
    debug.write(node_debug_1.MessageType.Value, `row=${JSON.stringify(row)}`);
    if (row) {
        throw new node_errors_1.ConflictError(`Table (${tableName}) row already exists`);
    }
    debug.write(node_debug_1.MessageType.Exit);
});
exports.checkPrimaryKey = checkPrimaryKey;
const checkUniqueKey = (query, tableName, uniqueKey) => __awaiter(void 0, void 0, void 0, function* () {
    const debug = new node_debug_1.Debug(`${debugSource}.checkUniqueKey`);
    debug.write(node_debug_1.MessageType.Entry, `tableName=${tableName};uniqueKey=${JSON.stringify(uniqueKey)};`);
    debug.write(node_debug_1.MessageType.Step, 'Finding row by key...');
    const row = yield findByKey(query, tableName, uniqueKey, true);
    debug.write(node_debug_1.MessageType.Value, `row=${JSON.stringify(row)}`);
    if (row) {
        throw new node_errors_1.ConflictError(`Table (${tableName}) row with ` +
            `unique key (${Object.keys(uniqueKey).join(', ')}) ` +
            `value (${Object.values(uniqueKey)
                .map((x) => typeof x == 'string' ? `"${x}"` : x == null ? 'null' : x)
                .join(', ')}) ` +
            'already exists');
    }
    debug.write(node_debug_1.MessageType.Exit);
});
exports.checkUniqueKey = checkUniqueKey;
const checkForeignKey = (query, tableName, foreignKey) => __awaiter(void 0, void 0, void 0, function* () {
    const debug = new node_debug_1.Debug(`${debugSource}.checkForeignKey`);
    debug.write(node_debug_1.MessageType.Entry, `tableName=${tableName};foreignKey=${JSON.stringify(foreignKey)};`);
    debug.write(node_debug_1.MessageType.Step, 'Finding row count by key...');
    const rowCount = yield findByKey(query, tableName, foreignKey, false);
    debug.write(node_debug_1.MessageType.Value, `rowCount=${rowCount}`);
    if (rowCount) {
        throw new node_errors_1.ConflictError(`Table (${tableName}) row${rowCount == 1 ? '' : `s (${rowCount})`} with ` +
            `foreign key (${Object.keys(foreignKey).join(', ')}) ` +
            `value (${Object.values(foreignKey)
                .map((x) => typeof x == 'string' ? `"${x}"` : x == null ? 'null' : x)
                .join(', ')}) ` +
            `still exist${rowCount == 1 ? 's' : ''}`);
    }
    debug.write(node_debug_1.MessageType.Exit);
});
exports.checkForeignKey = checkForeignKey;
const findByPrimaryKey = (query, tableName, primaryKey, options) => __awaiter(void 0, void 0, void 0, function* () {
    const debug = new node_debug_1.Debug(`${debugSource}.findByPrimaryKey`);
    debug.write(node_debug_1.MessageType.Entry, `tableName=${tableName};primaryKey=${JSON.stringify(primaryKey)}` +
        (typeof options !== 'undefined'
            ? `;options=${JSON.stringify(options)}`
            : ''));
    debug.write(node_debug_1.MessageType.Step, 'Finding row by key...');
    const row = yield findByKey(query, tableName, primaryKey, options || true);
    if (!row) {
        throw new node_errors_1.NotFoundError(`Table (${tableName}) row not found`);
    }
    debug.write(node_debug_1.MessageType.Exit, `row=${JSON.stringify(row)}`);
    return row;
});
exports.findByPrimaryKey = findByPrimaryKey;
const findByUniqueKey = (query, tableName, uniqueKey, options) => __awaiter(void 0, void 0, void 0, function* () {
    const debug = new node_debug_1.Debug(`${debugSource}.findByUniqueKey`);
    debug.write(node_debug_1.MessageType.Entry, `tableName=${tableName};uniqueKey=${JSON.stringify(uniqueKey)}` +
        (typeof options !== 'undefined'
            ? `;options=${JSON.stringify(options)}`
            : ''));
    debug.write(node_debug_1.MessageType.Step, 'Finding row by key...');
    const row = yield findByKey(query, tableName, uniqueKey, options || true);
    if (!row) {
        throw new node_errors_1.NotFoundError(`Table (${tableName}) row with ` +
            `unique key (${Object.keys(uniqueKey).join(', ')}) ` +
            `value (${Object.values(uniqueKey)
                .map((x) => typeof x == 'string' ? `"${x}"` : x == null ? 'null' : x)
                .join(', ')}) ` +
            'not found');
    }
    debug.write(node_debug_1.MessageType.Exit, `row=${JSON.stringify(row)}`);
    return row;
});
exports.findByUniqueKey = findByUniqueKey;
const createRow = (query, tableName, data, returningColumnNames) => __awaiter(void 0, void 0, void 0, function* () {
    const debug = new node_debug_1.Debug(`${debugSource}.createRow`);
    debug.write(node_debug_1.MessageType.Entry, `tableName=${tableName};` +
        `data=${JSON.stringify(data)}` +
        (typeof returningColumnNames !== 'undefined'
            ? `;returningColumnNames=${JSON.stringify(returningColumnNames)}`
            : ''));
    const text = `INSERT INTO ${tableName} ` +
        (Object.keys(data).length ? `(${Object.keys(data).join(', ')}) ` : '') +
        'VALUES (' +
        (Object.keys(data).length
            ? `${Object.keys(data)
                .map((x, i) => `$${i + 1}`)
                .join(', ')}`
            : 'default') +
        `) RETURNING ${typeof returningColumnNames !== 'undefined'
            ? returningColumnNames.join(', ')
            : '*'}`;
    debug.write(node_debug_1.MessageType.Value, `text=(${text})`);
    const values = Object.values(data);
    debug.write(node_debug_1.MessageType.Value, `values=${JSON.stringify(values)}`);
    debug.write(node_debug_1.MessageType.Step, 'Creating row...');
    const row = (yield query(text, values)).rows[0];
    debug.write(node_debug_1.MessageType.Exit, `row=${JSON.stringify(row)}`);
    return row;
});
exports.createRow = createRow;
const updateRow = (query, tableName, primaryKey, data, returningColumnNames) => __awaiter(void 0, void 0, void 0, function* () {
    const debug = new node_debug_1.Debug(`${debugSource}.updateRow`);
    debug.write(node_debug_1.MessageType.Entry, `tableName=${tableName};` +
        `primaryKey=${JSON.stringify(primaryKey)};` +
        `data=${JSON.stringify(data)}` +
        (typeof returningColumnNames !== 'undefined'
            ? `;returningColumnNames=${JSON.stringify(returningColumnNames)}`
            : ''));
    const text = `UPDATE ${tableName} ` +
        `SET ${Object.keys(data)
            .map((x, i) => `${x} = $${i + 1}`)
            .join(', ')} ` +
        `WHERE ${Object.keys(primaryKey)
            .map((x, i) => `${x} = $${Object.keys(data).length + i + 1}`)
            .join(' AND ')} ` +
        `RETURNING ${typeof returningColumnNames !== 'undefined'
            ? returningColumnNames.join(', ')
            : '*'}`;
    debug.write(node_debug_1.MessageType.Value, `text=(${text})`);
    const values = [...Object.values(data), ...Object.values(primaryKey)];
    debug.write(node_debug_1.MessageType.Value, `values=${JSON.stringify(values)}`);
    debug.write(node_debug_1.MessageType.Step, 'Updating row...');
    const row = (yield query(text, values)).rows[0];
    debug.write(node_debug_1.MessageType.Exit, `row=${JSON.stringify(row)}`);
    return row;
});
exports.updateRow = updateRow;
const deleteRow = (query, tableName, primaryKey) => __awaiter(void 0, void 0, void 0, function* () {
    const debug = new node_debug_1.Debug(`${debugSource}.deleteRow`);
    debug.write(node_debug_1.MessageType.Entry, `tableName=${tableName};primaryKey=${JSON.stringify(primaryKey)}`);
    const text = `DELETE FROM ${tableName} ` +
        `WHERE ${Object.keys(primaryKey)
            .map((x, i) => `${x} = $${i + 1}`)
            .join(' AND ')}`;
    debug.write(node_debug_1.MessageType.Value, `text=(${text})`);
    const values = Object.values(primaryKey);
    debug.write(node_debug_1.MessageType.Value, `values=${JSON.stringify(values)}`);
    debug.write(node_debug_1.MessageType.Step, 'Deleting row...');
    yield query(text, values);
    debug.write(node_debug_1.MessageType.Exit);
});
exports.deleteRow = deleteRow;
