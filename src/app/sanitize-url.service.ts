import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SanitizeUrlService {

  constructor(private sanitizer: DomSanitizer,) { 

  }

  sanitizeUrl(embedUrl: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(embedUrl);
  }
  
}
