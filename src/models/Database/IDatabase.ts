
// Interfaz para la base de datos
// Interfaz para la base de datos
interface IDatabase {
  get<T = unknown>(query: string, params: unknown[]): Promise<T>; // default type is any T | undefined
  all<T = unknown>(query: string, params: unknown[]): Promise<T[]>;
  run(query: string, params: unknown[]): Promise<{ affectedRows: number }>;
  getConnectionState(): boolean;
}

export default IDatabase;

/*
// eslint-disable @typescript-eslint/no-explicit-any
interface IDatabase {
  get: (query: string, params: any[]) => Promise<any>

  all: (query: string, params: any[]) => Promise<any>

  run: (query: string, params: any[]) => Promise<any>

  getConnectionState: () => boolean;
}

export default IDatabase;
*/