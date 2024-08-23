import { Query } from 'database';
interface Options {
    columnNames?: string[];
    forUpdate?: boolean;
}
export declare const checkPrimaryKey: (query: Query, tableName: string, instanceName: string, primaryKey: Record<string, any>) => Promise<void>;
export declare const checkUniqueKey: (query: Query, tableName: string, instanceName: string, uniqueKey: Record<string, any>) => Promise<void>;
export declare const findByPrimaryKey: (query: Query, tableName: string, instanceName: string, primaryKey: Record<string, any>, options?: Options) => Promise<object>;
export declare const findByUniqueKey: (query: Query, tableName: string, instanceName: string, uniqueKey: Record<string, any>, options?: Options) => Promise<object>;
export declare const createRow: (query: Query, tableName: string, data: Record<string, any>, returningColumnNames?: string[]) => Promise<object>;
export declare const updateRow: (query: Query, tableName: string, primaryKey: Record<string, any>, data: Record<string, any>, returningColumnNames?: string[]) => Promise<object>;
export declare const deleteRow: (query: Query, tableName: string, primaryKey: Record<string, any>) => Promise<void>;
export {};
