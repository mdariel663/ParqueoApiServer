
// Interfaz para la base de datos
// Interfaz para la base de datos
interface IDatabase {
  get<T = unknown>(query: string, params: unknown[]): Promise<T>; // default type is any T | undefined
  all<T = unknown>(query: string, params: unknown[]): Promise<T[]>;
  run(query: string, params: unknown[]): Promise<{ affectedRows: number }>;
  runPlusPlus<T = unknown>(query: string, params: unknown[]): Promise<T>;

  getConnectionState(): boolean;
}

export default IDatabase;
