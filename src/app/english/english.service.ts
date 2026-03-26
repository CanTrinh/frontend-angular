import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';


import { Observable, catchError, map } from 'rxjs';

import { User } from './english';
import { HttpErrorHandler, HandleError } from '../http-error-handler.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    Authorization: 'my-auth-token'
  })
};

@Injectable({
  providedIn: 'root',
})
export class EnglishService {
  //englishUrl = `${environment.apiUrl}`;  // URL to web api
  englishUrl= `http://localhost.3000`;
  private errorHandler = inject(HttpErrorHandler);
  private handleError: HandleError;

  constructor(
    private http: HttpClient,
    ) {
      
    this.handleError = this.errorHandler.createHandleError('EnglishService');
  
  }

  uploadMedia(formData: FormData): Observable<any>{
    return this.http.post(this.englishUrl, formData)
    .pipe(
      // Nếu lỗi, trả về object rỗng hoặc error tùy ý
      catchError(this.handleError('Loi tao post english', null))
    );
  }
  
}
