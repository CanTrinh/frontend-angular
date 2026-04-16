import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class HttpCacheService {
  private cache = new Map<string, { expiry: number, response: HttpResponse<any> }>();
  private readonly MAX_CACHE_AGE = 30000; // Thời gian sống của cache: 30 giây

  put(url: string, response: HttpResponse<any>): void {
    this.cache.set(url, { expiry: Date.now() + this.MAX_CACHE_AGE, response });
  }

  get(url: string): HttpResponse<any> | undefined {
    const cached = this.cache.get(url);
    if (!cached) return undefined;

    const isExpired = Date.now() > cached.expiry;
    if (isExpired) {
      this.cache.delete(url);
      return undefined;
    }
    return cached.response;
  }

  clear() {
    this.cache.clear();
  }
}
