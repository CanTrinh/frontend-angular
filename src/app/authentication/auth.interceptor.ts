// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoginService } from '../features/auth/login/login.service';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
 const authService = inject(LoginService);
 
  const access_token = authService.getToken();
  let clonedReq = req.clone({
    withCredentials: true 
  });
  if (access_token) {
    clonedReq = clonedReq.clone({
      setHeaders: { Authorization: `Bearer ${access_token}` }
    });
  }
  return next(clonedReq);
};

