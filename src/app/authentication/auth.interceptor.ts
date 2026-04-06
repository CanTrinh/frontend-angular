// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoginService } from '../features/auth/login/login.service';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(LoginService);
  const access_token = authService.getToken();

  // KIỂM TRA: Nếu request gửi đến Server của bạn (ctlife.xyz)
  if (req.url.includes('api.ctlife.xyz')) {
    // Tạo bản clone có withCredentials (để gửi/nhận Cookie Refresh)
    let clonedReq = req.clone({ withCredentials: true });

    // Nếu đã có Access Token thì gắn vào Header
    if (access_token) {
      clonedReq = clonedReq.clone({
        setHeaders: { Authorization: `Bearer ${access_token.trim()}` }
      });
    }
    
    // Gửi bản clone (đã có Credentials và Token nếu có)
    return next(clonedReq);
  }

  // NGƯỢC LẠI: Nếu là API bên thứ ba (Thời tiết, v.v.)
  // Gửi request gốc (Sạch sẽ, không Cookie, không Token) để tránh lỗi SameSite/CORS
  return next(req);
};

