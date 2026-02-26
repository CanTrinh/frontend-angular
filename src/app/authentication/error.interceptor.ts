// error.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoginService } from '../features/auth/login/login.service';
import { MessageService } from '../message.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(LoginService);
  const messageService = inject(MessageService);

  return next(req).pipe(
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
  );
};