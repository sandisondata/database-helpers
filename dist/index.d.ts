import { Query } from 'database';
type Options = {
    columnNames?: string[];
    forUpdate?: boolean;
};
/**
 * Check if a row with a given primary key already exists in a table.
 *
 * @param query - Database query interface
 * @param tableName - Name of the table
 * @param primaryKey - Primary key to search for
 * @throws ConflictError if the row already exists
 */
export declare const checkPrimaryKey: (query: Query, tableName: string, primaryKey: Record<string, any>) => Promise<void>;
/**
 * Check if a row with a given unique key already exists in a table.
 *
 * @param query - Database query interface
 * @param tableName - Name of the table
 * @param uniqueKey - Unique key to search for
 * @throws ConflictError if the row already exists
 */
export declare const checkUniqueKey: (query: Query, tableName: string, uniqueKey: Record<string, any>) => Promise<void>;
/**
 * Check if any rows with a given foreign key exist in a table.
 *
 * @param query - Database query interface
 * @param tableName - Name of the table
 * @param foreignKey - Foreign key to search for
 * @throws ConflictError if any rows exist
 */
export declare const checkForeignKey: (query: Query, tableName: string, foreignKey: Record<string, any>) => Promise<void>;
/**
 * Find a row in a table by its primary key.
 *
 * @param query - Database query interface
 * @param tableName - Name of the table
 * @param primaryKey - Primary key of the row to search for
 * @param options - Options to pass to findRowByKey (optional)
 * @throws NotFoundError if the row is not found
 * @returns Found row
 */
export declare const findRowByPrimaryKey: (query: Query, tableName: string, primaryKey: Record<string, any>, options?: Options) => Promise<object>;
/**
 * Find a row in a table by its unique key.
 *
 * @param query - Database query interface
 * @param tableName - Name of the table
 * @param uniqueKey - Unique key of the row to search for
 * @param options - Options to pass to findRowByKey (optional)
 * @throws NotFoundError if the row is not found
 * @returns Found row
 */
export declare const findRowByUniqueKey: (query: Query, tableName: string, uniqueKey: Record<string, any>, options?: Options) => Promise<object>;
/**
 * Create a new row in a table.
 *
 * @param query - Database query interface
 * @param tableName - Name of the table
 * @param data - Data to insert into the table
 * @param returningColumnNames - Column names to return in the result (optional)
 * @returns Created row
 */
export declare const createRow: (query: Query, tableName: string, data: Record<string, any>, returningColumnNames?: string[]) => Promise<object>;
/**
 * Update an existing row in a table.
 *
 * @param query - Database query interface
 * @param tableName - Name of the table
 * @param primaryKey - Primary key of the row to update
 * @param data - Data to update in the table
 * @param returningColumnNames - Column names to return in the result (optional)
 * @returns Updated row
 */
export declare const updateRow: (query: Query, tableName: string, primaryKey: Record<string, any>, data: Record<string, any>, returningColumnNames?: string[]) => Promise<object>;
/**
 * Delete an existing row in a table.
 *
 * @param query - Database query interface
 * @param tableName - Name of the table
 * @param primaryKey - Primary key of the row to delete
 */
export declare const deleteRow: (query: Query, tableName: string, primaryKey: Record<string, any>) => Promise<void>;
export {};
