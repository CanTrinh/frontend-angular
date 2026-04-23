import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { BehaviorSubject, Observable, catchError, map, take, tap, throwError } from 'rxjs';
import { UserSignIn } from './dto/loginUser';
//import { HttpErrorHandler, HandleError } from '../../../http-error-handler.service';
import { RegisterUser } from './dto/registerUser.dto';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment.prod';
import { SocketService } from 'src/app/core/services/socket.service';

export const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    Authorization: 'my-auth-token'
  }),

};

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  loginUrl = `${environment.apiUrl}/auth/login`; 
  registerUrl = `${environment.apiUrl}/user/register`;
  API_URL = `${environment.apiUrl}/auth`;
  //private handleError: HandleError;
  private userSubject = new BehaviorSubject<any>(this.getInitialUser());
  user$ = this.userSubject.asObservable();
  
  constructor(
      private http: HttpClient,
      private router: Router,
      private socketService: SocketService
      //httpErrorHandler: HttpErrorHandler
      ) {

    // BƯỚC 1: Hồi sinh dữ liệu khi F5
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.userSubject.next(user); // Nạp lại vào Subject
      } catch (e) {
        localStorage.removeItem('user'); // Xóa nếu dữ liệu lỗi
      }
    }

    // BƯỚC 2: Tự động kết nối/ngắt Socket
    // Nhờ Bước 1, khi F5 biến 'user' sẽ có giá trị và hàm dưới đây sẽ tự connect
    this.user$.subscribe(user => {
      if (user && user.sub) {
        this.socketService.connect(user.sub);
      } else {
        this.socketService.disconnect();
      }
    });

  }

  private getInitialUser() {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  }
  
    
  signINUser(userSignIn: UserSignIn): Observable<UserSignIn> {
      return this.http.post<UserSignIn>(`${this.loginUrl}`, userSignIn, httpOptions)

        .pipe(
          //catchError(this.handleError('signInUser', userSignIn))
          tap(res =>{
            localStorage.setItem('access_token', res.access_token);
            localStorage.setItem('user', JSON.stringify(res.userInfor));
            this.userSubject.next(res.userInfor);

          })

        );
    }

    // auth.service.ts
  updateUserLocal(newUserInfo: any) {
    // 1. Lấy thông tin user hiện tại đang có trong Subject
    const currentUser = this.userSubject.value;

    // 2. Gộp thông tin cũ với thông tin mới (ví dụ: đè avatarUrl mới lên)
    const updatedUser = { ...currentUser, ...newUserInfo };

    // 3. Phát dữ liệu mới cho toàn bộ ứng dụng (Header, Sidebar... sẽ nhận được ngay)
    this.userSubject.next(updatedUser);

    // 4. (Quan trọng) Cập nhật lại vào sessionStorage/localStorage 
    // để khi người dùng F5 trang, thông tin mới vẫn còn đó.
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }


  getToken(): string | null { 
      return localStorage.getItem('access_token');
   }

isLoggedIn(): boolean { 
    const token = this.getToken(); 
    return !!token; // true if token exists 
  }


   /* Lấy Refresh Token hiện tại
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }*/

  // Lưu cặp token mới sau khi refresh thành công
saveTokens(access_token: string) {
    localStorage.setItem('access_token', access_token);
    //localStorage.setItem('refresh_token', refreshToken);
  }
      // Hàm quan trọng nhất: Gọi lên NestJS để đổi token
refreshToken(): Observable<any> {
  return this.http.post<any>(`${this.API_URL}/refresh`, {})
    .pipe(
      tap((res) => {
        // CẬP NHẬT CÁI CŨ: Ghi đè Access Token mới vào LocalStorage
        this.saveTokens(res.access_token);
      }),
      catchError((err) => {
        this.logout(); // Nếu refresh lỗi (hết hạn cả 2), bắt login lại
        return throwError(() => err);
      })
    );
}

loadUserFromStorage() {
  // Đổi từ localStorage 
  const savedUser = localStorage.getItem('user'); 
  
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      // Đẩy dữ liệu vào Subject để các Component (Header, Profile) nhận được ảnh/tên
      this.userSubject.next(user); 
    } catch (e) {
      console.error("Lỗi đọc dữ liệu user từ localStorage", e);
      //this.logout(); // Nếu dữ liệu lỗi, ép logout cho an toàn
    }
  }
}


logout() {
  // 1. Dọn dẹp local TRƯỚC để chặn vòng lặp
  const token = localStorage.getItem('access_token');

  // 1. Ngắt kết nối Socket ngay lập tức
  this.socketService.disconnect(); 
  // don dep localstorage
  this.clearSession(); 

  // 2. Chỉ gọi API logout lên server nếu có token và không phải trường hợp server đang sập
  if (token) {
    this.http.post(`${this.API_URL}/logout`, {}, { withCredentials: true })
      .pipe(take(1)) // Đảm bảo chỉ thực hiện 1 lần
      .subscribe({
        next: () => console.log('Server session cleared'),
        error: () => console.log('Server unreachable, local cleared anyway')
      });
  }
}

private clearSession() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  this.userSubject.next(null);
  
  // Kiểm tra nếu không phải đang ở trang login thì mới điều hướng
  if (this.router.url !== '/login') {
    this.router.navigate(['/login']);
  }
}




  registerUser(registerUser: RegisterUser):Observable<RegisterUser>
    {
      return this.http.post<RegisterUser>(`${this.registerUrl}`, registerUser, httpOptions)
       /* .pipe(
          catchError(this.handleError('registerUser', registerUser))
        );*/
  }
  
}
