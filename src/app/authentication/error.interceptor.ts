// error.interceptor.ts
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoginService } from '../features/auth/login/login.service';
import { MessageService } from '../message.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(LoginService);
  const messageService = inject(MessageService);

  /*return next(req).pipe(
    catchError(error => {
      const status = error.status;

      // Log error message
      messageService.add(`HTTP Error ${status}: ${error.message}`);

      // 🔑 Auto logout on 401/403
      if (status === 401 || status === 403) {
        authService.logout();
      }

      return throwError(() => error);
    })
  );*/
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Đã có lỗi xảy ra';

      if (error.error instanceof ErrorEvent) {
        // Lỗi phía Client (mạng, code...)
        errorMessage = `Lỗi: ${error.error.message}`;
      } else {
        // Lỗi phía Server (AWS trả về)
        errorMessage = `Mã lỗi: ${error.status} - ${error.message}`;
        
        // Tự động logout nếu hết hạn (401/403)
        if (error.status === 401 || error.status === 403) {
          authService.logout();
        }
      }

      // Đẩy vào MessageService để hiển thị lên UI
      messageService.add(errorMessage);
      
      return throwError(() => error);
    })
  );
};

