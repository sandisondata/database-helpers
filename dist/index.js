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
exports.findByUniqueKey = exports.checkUniqueKey = exports.findByPrimaryKey = void 0;
const node_errors_1 = require("node-errors");
const findByKey = (query_1, tableName_1, key_1, ...args_1) => __awaiter(void 0, [query_1, tableName_1, key_1, ...args_1], void 0, function* (query, tableName, key, forUpdate = false) {
    const rows = (yield query(`SELECT * FROM ${tableName} ` +
        `WHERE ${Object.keys(key)
            .map((x, i) => `${x} = $${i + 1}`)
            .join(' AND ')} ` +
        `LIMIT 1${forUpdate ? ' FOR UPDATE' : ''}`, Object.values(key))).rows;
    return rows.length ? rows[0] : null;
});
const findByPrimaryKey = (query_1, tableName_1, instanceName_1, primaryKey_1, ...args_1) => __awaiter(void 0, [query_1, tableName_1, instanceName_1, primaryKey_1, ...args_1], void 0, function* (query, tableName, instanceName, primaryKey, forUpdate = false) {
    const row = yield findByKey(query, tableName, primaryKey, forUpdate);
    if (!row) {
        throw new node_errors_1.NotFoundError(`${instanceName} not found`);
    }
    return row;
});
exports.findByPrimaryKey = findByPrimaryKey;
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
