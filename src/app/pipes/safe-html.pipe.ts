import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml',
  standalone: true // Rất quan trọng nếu bạn dùng Standalone Component
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return '';
    // Lệnh này bảo Angular: "Tôi tin tưởng chuỗi HTML này, hãy render nó"
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}
