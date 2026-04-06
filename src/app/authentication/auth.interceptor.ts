// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoginService } from '../features/auth/login/login.service';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
 const authService = inject(LoginService);
 
  const access_token = authService.getToken();
  if (access_token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${access_token}` }
    });
    return next(cloned);
  }
  return next(req);
};

