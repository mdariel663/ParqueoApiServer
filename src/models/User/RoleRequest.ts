export default class RoleRequest {
    public messageError: string = "";
    public isValid: boolean = true;
    
    constructor(public role: string){
        if (!role) {
            this.isValid = false;
            this.messageError = "El campo role es obligatorio";
        } else if (role !== "admin" && role !== "empleado" && role !== "cliente") {
            this.messageError = "El rol debe ser admin, empleado o cliente";
            this.isValid = false;
        }
    }
}