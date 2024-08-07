import { Query } from 'database';
export declare const findByPrimaryKey: (query: Query, tableName: string, instanceName: string, primaryKey: Record<string, any>, forUpdate?: boolean) => Promise<object>;
export declare const checkUniqueKey: (query: Query, tableName: string, instanceName: string, uniqueKey: Record<string, any>) => Promise<void>;
export declare const findByUniqueKey: (query: Query, tableName: string, instanceName: string, uniqueKey: Record<string, any>, forUpdate?: boolean) => Promise<object>;
