import { Query } from 'database';
export declare enum KeyType {
    Primary = 0,
    Unique = 1
}
export declare const checkKey: (query: Query, tableName: string, instanceName: string, key: Record<string, any>, keyType?: KeyType) => Promise<void>;
export declare const findByKey: (query: Query, tableName: string, instanceName: string, key: Record<string, any>, keyType?: KeyType, forUpdate?: boolean) => Promise<object>;
export declare const createRow: (query: Query, tableName: string, data: Record<string, any>) => Promise<object>;
export declare const updateRow: (query: Query, tableName: string, primaryKey: Record<string, any>, data: Record<string, any>) => Promise<object>;
export declare const deleteRow: (query: Query, tableName: string, primaryKey: Record<string, any>) => Promise<void>;
