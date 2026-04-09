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
  let isServerDown = false; // Biến dùng chung để chặn thông báo lặp

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      //loi mat ket noi hoac sap server
      if (error.status === 0) {
        if (!isServerDown) {
          isServerDown = true; // Đánh dấu đã báo lỗi
          
          authService.logout();
          messageService.add('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại!');

          // Sau 5-10 giây cho phép báo lại nếu người dùng vẫn cố thực hiện hành động
          setTimeout(() => isServerDown = false, 5000);
        }
        return throwError(() => error);
      }

      // Reset cờ nếu có một request bất kỳ thành công hoặc lỗi khác 0 (Server đã sống lại)
      isServerDown = false;
      // 1. Xử lý lỗi 401 (Hết hạn Access Token)
      if (error.status === 401) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.refreshToken().pipe(
            switchMap((res: any) => {
              isRefreshing = false;
              authService.saveTokens(res.accessToken); // Lưu token mới
              refreshTokenSubject.next(res.accessToken);
              
              // Thử lại request cũ với token mới
              return next(req.clone({
                setHeaders: { Authorization: `Bearer ${res.accessToken}` }
              }));
            }),
            catchError((err) => {
              isRefreshing = false;
              authService.logout(); // Refresh thất bại mới logout
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
      } else {
        errorMessage = `Mã lỗi: ${error.status} - ${error.message}`;
        if (error.status === 403) {
            authService.logout(); // 403 thường là bị cấm quyền, nên logout hoặc đẩy về Home
        }
      }

      messageService.add(errorMessage);
      return throwError(() => error);
    })
  );
};
