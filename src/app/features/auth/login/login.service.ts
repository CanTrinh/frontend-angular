import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { BehaviorSubject, Observable, catchError, map, tap } from 'rxjs';
import { UserSignIn } from './dto/loginUser';
//import { HttpErrorHandler, HandleError } from '../../../http-error-handler.service';
import { RegisterUser } from './dto/registerUser.dto';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment.prod';

export const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    Authorization: 'my-auth-token'
  })
};

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  loginUrl = `${environment.apiUrl}/auth/login`;  // URL to web api
  registerUrl = `${environment.apiUrl}/user/register`;
  //private handleError: HandleError;
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();
  
  constructor(
      private http: HttpClient,
      private router: Router,
      //httpErrorHandler: HttpErrorHandler
      ) {
      //this.handleError = httpErrorHandler.createHandleError('LoginService');
  }
  
    
    signINUser(userSignIn: UserSignIn): Observable<UserSignIn> {
      return this.http.post<UserSignIn>(`${this.loginUrl}`, userSignIn, httpOptions)

        .pipe(
          //catchError(this.handleError('signInUser', userSignIn))
          tap(res =>{
            sessionStorage.setItem('token', res.access_token);
            sessionStorage.setItem('user', JSON.stringify(res.userInfor));
            this.userSubject.next(res.userInfor);

          })

        );
    }

    getToken(): string | null { 
      return sessionStorage.getItem('token');
   }

   isLoggedIn(): boolean { 
    const token = this.getToken(); 
    return !!token; // true if token exists 
    }

  loadUserFromStorage() {
  // Đổi từ localStorage sang sessionStorage
  const savedUser = sessionStorage.getItem('user'); 
  
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      // Đẩy dữ liệu vào Subject để các Component (Header, Profile) nhận được ảnh/tên
      this.userSubject.next(user); 
    } catch (e) {
      console.error("Lỗi đọc dữ liệu user từ session", e);
      this.logout(); // Nếu dữ liệu lỗi, ép logout cho an toàn
    }
  }
}


 logout() {
  // 1. Xóa sạch mọi thứ trong sessionStorage (Token, User Info, v.v.)
  sessionStorage.clear();
  // Hoặc dùng sessionStorage.clear() để xóa toàn bộ cho chắc chắn
  
  // 2. Cập nhật Subject để các Component (Header/Avatar) ẩn ảnh người dùng ngay lập tức
  this.userSubject.next(null);
  
  // 3. Điều hướng người dùng về trang Login
  this.router.navigate(['/login']);
  
  // (Tùy chọn) Gọi thêm API logout ở Backend nếu bạn cần xóa session ở server
  // this.http.post(`${API_URL}/auth/logout`, {}).subscribe();
}



    registerUser(registerUser: RegisterUser):Observable<RegisterUser>
    {
      return this.http.post<RegisterUser>(`${this.registerUrl}`, registerUser, httpOptions)
       /* .pipe(
          catchError(this.handleError('registerUser', registerUser))
        );*/
    }
  
}
