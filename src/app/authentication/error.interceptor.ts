import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoginService } from '../features/auth/login/login.service';
import { MessageService } from '../message.service';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(LoginService);
  const messageService = inject(MessageService);


  // 1. Định nghĩa DANH SÁCH các từ khóa URL được phép đi qua tự do
  const PUBLIC_APIS = [
    '/login',
    '/register',
    '/logout',
    '/posts',        
    '/products/list', 
    '/news'            
  ];

  // 2. Tự động kiểm tra xem Request hiện tại có thuộc danh sách công khai không
  const isPublicApi = PUBLIC_APIS.some(api => req.url.includes(api));

  // 3. Nếu KHÔNG PHẢI API công khai VÀ (đang logout HOẶC không có token) -> Chặn lại
  if (!isPublicApi) {
    if (authService.isLoggingOut || !localStorage.getItem('access_token')) {
      return throwError(() => new HttpErrorResponse({ 
        status: 401, 
        statusText: 'Unauthorized (No token or Logging out)' 
      }));
    }
  }
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      //loi mat ket noi hoac sap server
      if (error.status === 0) {
        /* CHỈ gọi logout nếu chưa có luồng logout nào đang chạy
        if (!isLoggingOut) {
          isLoggingOut = true;
          authService.logout();
          
          // Reset flag sau một khoảng thời gian ngắn
          setTimeout(() => isLoggingOut = false, 2000);
        }*/

        // Dùng biến flag từ authService để đồng bộ giữa các request
        if (!authService.isLoggingOut) {
          authService.logout();
        }
        return throwError(() => error);
      }
      

      
      // 1. Xử lý lỗi 401 (Hết hạn Access Token)
      if (error.status === 401||error.status === 403) {
        // NẾU ĐANG LOGOUT THÌ KHÔNG REFRESH TOKEN NỮA
        if (authService.isLoggingOut) {
          return throwError(() => error);
        }

        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.refreshToken().pipe(
            switchMap((res: any) => {
              isRefreshing = false;
              authService.saveTokens(res.access_token); // Lưu token mới
              refreshTokenSubject.next(res.access_token);
              
              // Thử lại request cũ với token mới
              return next(req.clone({
                setHeaders: { Authorization: `Bearer ${res.access_token.trim()}` }
              }));
            }),
            catchError((err) => {
              isRefreshing = false;
              // Nếu refresh thất bại và không phải đang tự bấm logout thì mới kích hoạt hàm logout
              if (!authService.isLoggingOut) {
                authService.logout(); 
              }
              return throwError(() => err);
            })
          );
        } else {
          // Đợi token mới nếu đang có request refresh khác chạy
          return refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap(token => next(req.clone({
              setHeaders: { Authorization: `Bearer ${token}` }
            })))
          );
        }
      }

      // 2. Xử lý các lỗi khác (403, 404, 500...)
      let errorMessage = 'Đã có lỗi xảy ra';
      if (error.error instanceof ErrorEvent) {
        errorMessage = `Lỗi: ${error.error.message}`;
      } /*else {
        errorMessage = `Mã lỗi: ${error.status} - ${error.message}`;
        if (error.status === 403) {
            //authService.logout(); // 403 thường là bị cấm quyền, nên logout hoặc đẩy về Home
            errorMessage= 'lỗi không có quyền thực hiện';
        }
      }*/

      messageService.add(errorMessage);
      return throwError(() => error);
    })
  );
};
