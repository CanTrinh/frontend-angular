import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SanitizeUrlService {
  constructor(private sanitizer: DomSanitizer) {}

  // Dùng cho ảnh hoặc link thông thường
  sanitizeUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  // 🔑 Dùng riêng cho IFRAME (YouTube/Vimeo)
  sanitizeResourceUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
