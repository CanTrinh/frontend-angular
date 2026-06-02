export interface UserSignIn {
    access_token: string;
    userInfor:{
        sub?: number;
        name: string;
        password?: string;  
    }
}