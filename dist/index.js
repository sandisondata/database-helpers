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
const node_errors_1 = require("node-errors");
const findByKey = (query_1, tableName_1, key_1, ...args_1) => __awaiter(void 0, [query_1, tableName_1, key_1, ...args_1], void 0, function* (query, tableName, key, forUpdate = false) {
    const rows = (yield query(`SELECT * FROM ${tableName} ` +
        `WHERE ${Object.keys(key)
            .map((x, i) => `${x} = $${i + 1}`)
            .join(' AND ')} ` +
        `LIMIT 1${forUpdate ? ' FOR UPDATE' : ''}`, Object.values(key))).rows;
    return rows.length ? rows[0] : null;
});
const checkPrimaryKey = (query, tableName, instanceName, primaryKey) => __awaiter(void 0, void 0, void 0, function* () {
    const row = yield findByKey(query, tableName, primaryKey);
    if (row) {
        throw new node_errors_1.ConflictError(`${instanceName} already exists`);
    }
});
exports.checkPrimaryKey = checkPrimaryKey;
const checkUniqueKey = (query, tableName, instanceName, uniqueKey) => __awaiter(void 0, void 0, void 0, function* () {
    const row = yield findByKey(query, tableName, uniqueKey);
    if (row) {
        throw new node_errors_1.ConflictError(`${instanceName} ` +
            `unique key (${Object.keys(uniqueKey).join(', ')}) ` +
            `value (${Object.values(uniqueKey).join(', ')}) ` +
            'already exists');
    }
});
exports.checkUniqueKey = checkUniqueKey;
const findByPrimaryKey = (query_1, tableName_1, instanceName_1, primaryKey_1, ...args_1) => __awaiter(void 0, [query_1, tableName_1, instanceName_1, primaryKey_1, ...args_1], void 0, function* (query, tableName, instanceName, primaryKey, forUpdate = false) {
    const row = yield findByKey(query, tableName, primaryKey, forUpdate);
    if (!row) {
        throw new node_errors_1.NotFoundError(`${instanceName} not found`);
    }
    return row;
});
exports.findByPrimaryKey = findByPrimaryKey;
const findByUniqueKey = (query_1, tableName_1, instanceName_1, uniqueKey_1, ...args_1) => __awaiter(void 0, [query_1, tableName_1, instanceName_1, uniqueKey_1, ...args_1], void 0, function* (query, tableName, instanceName, uniqueKey, forUpdate = false) {
    const row = yield findByKey(query, tableName, uniqueKey, forUpdate);
    if (!row) {
        throw new node_errors_1.NotFoundError(`${instanceName} ` +
            `unique key (${Object.keys(uniqueKey).join(', ')}) ` +
            `value (${Object.values(uniqueKey).join(', ')}) ` +
            'not found');
    }
    return row;
});
exports.findByUniqueKey = findByUniqueKey;
const createRow = (query, tableName, data) => __awaiter(void 0, void 0, void 0, function* () {
    const row = (yield query(`INSERT INTO ${tableName} (${Object.keys(data).join(', ')}) ` +
        `VALUES (${Object.keys(data)
            .map((x, i) => `$${i + 1}`)
            .join(', ')}) ` +
        'RETURNING *', Object.values(data))).rows[0];
    return row;
});
exports.createRow = createRow;
const updateRow = (query, tableName, primaryKey, data) => __awaiter(void 0, void 0, void 0, function* () {
    const row = (yield query(`UPDATE ${tableName} ` +
        `SET ${Object.keys(data)
            .map((x, i) => `${x} = $${i + 1}`)
            .join(' AND ')} ` +
        `WHERE ${Object.keys(primaryKey)
            .map((x, i) => `${x} = $${i + 1}`)
            .join(' AND ')} ` +
        'RETURNING *', [].concat(...Object.values(data), ...Object.values(primaryKey)))).rows[0];
    return row;
});
exports.updateRow = updateRow;
const deleteRow = (query, tableName, primaryKey) => __awaiter(void 0, void 0, void 0, function* () {
    yield query(`DELETE FROM ${tableName} ` +
        `WHERE ${Object.keys(primaryKey)
            .map((x, i) => `${x} = $${i + 1}`)
            .join(' AND ')}`, Object.values(primaryKey));
});
exports.deleteRow = deleteRow;
