
// Interfaz para la base de datos
interface IDatabase {
    get(query: string, params: any[]): Promise<any> ;
  
    all(query: string, params: any[]): Promise<any> ;
  
    run(query: string, params: any[]) : Promise<any> ;
}
export default IDatabase