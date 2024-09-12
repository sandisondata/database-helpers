import { Query } from 'database';
interface Options {
    columnNames?: string[];
    forUpdate?: boolean;
}
export declare const checkPrimaryKey: (query: Query, tableName: string, primaryKey: Record<string, string | number>) => Promise<void>;
export declare const findByPrimaryKey: (query: Query, tableName: string, primaryKey: Record<string, string | number>, options?: Options) => Promise<object>;
export declare const checkUniqueKey: (query: Query, tableName: string, uniqueKey: Record<string, string | number | boolean | null>) => Promise<void>;
export declare const findByUniqueKey: (query: Query, tableName: string, uniqueKey: Record<string, string | number | boolean | null>, options?: Options) => Promise<object>;
export declare const checkForeignKey: (query: Query, tableName: string, foreignKey: Record<string, string | number>) => Promise<void>;
export declare const createRow: (query: Query, tableName: string, data: Record<string, any>, returningColumnNames?: string[]) => Promise<object>;
export declare const updateRow: (query: Query, tableName: string, primaryKey: Record<string, string | number>, data: Record<string, any>, returningColumnNames?: string[]) => Promise<object>;
export declare const deleteRow: (query: Query, tableName: string, primaryKey: Record<string, string | number>) => Promise<void>;
export {};
