// comment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';


@Injectable({ providedIn: 'root' })
export class MessageService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getMessages() {
    return this.http.get<any[]>(`${this.apiUrl}/messages`);
  }

  createMessage(message:string) {
    
    return this.http.post<any>(`${this.apiUrl}/message/create`, message);
  }
}
