import { HttpContextToken } from '@angular/common/http';

// Tạo thẻ đánh dấu, mặc định là false (tức là mặc định API cần đăng nhập)
export const IS_PUBLIC_API = new HttpContextToken<boolean>(() => false);
