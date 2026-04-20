// comment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getCatergories(): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  createCategory() {
    
    return;
  }
}