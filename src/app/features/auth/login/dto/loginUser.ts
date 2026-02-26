export interface UserSignIn {
    access_token: string;
    userInfor:{
        id?: number;
        name: string;
        password?: string;  
    }
}