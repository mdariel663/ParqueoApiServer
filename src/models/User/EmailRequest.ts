export default class EmailRequest {
    public messageError: string = "";
    public isValid: boolean = true;
    
    constructor(public email: string){
        if (!email) {
            this.isValid = false;
            this.messageError = "El campo email es obligatorio";
        } else if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) {
            this.messageError = "El campo email no es válido";
            this.isValid = false;
        }
    }
}
