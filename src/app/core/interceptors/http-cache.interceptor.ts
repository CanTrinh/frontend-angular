import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of, tap } from 'rxjs';
import { HttpCacheService } from '../services/http-cache.service';

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const cacheService = inject(HttpCacheService);

  // 1. Nếu là POST, PUT, DELETE: Thực hiện xong thì xóa sạch cache
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    return next(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          console.log('Phát hiện thay đổi dữ liệu, đang xóa cache...');
          cacheService.clear(); // Xóa sạch bộ nhớ để lần GET tới sẽ lấy data mới
        }
      })
    );
  }

  // 2. Chỉ xử lý Cache cho request GET
  if (req.method === 'GET') {
    // Kiểm tra Header đặc biệt để bỏ qua cache (x-refresh)
    const shouldRefresh = req.headers.get('x-refresh') === 'true';

    if (!shouldRefresh) {
      const cachedResponse = cacheService.get(req.urlWithParams);
      if (cachedResponse) {
        console.log('Lấy dữ liệu từ Cache:', req.url);
        return of(cachedResponse);
      }
    } else {
      console.log('Bỏ qua cache do có Header x-refresh');
    }

    // Gửi request mới và lưu vào cache
    return next(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          cacheService.put(req.urlWithParams, event);
        }
      })
    );
  }

  return next(req);
};
