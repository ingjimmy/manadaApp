export class LoginModel {
    grant_type:string = 'password';
    username:string;
    password:string;
    client_id:string;
    client_secret:string;
}