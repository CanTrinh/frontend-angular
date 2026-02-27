import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';

import { Observable, catchError, map } from 'rxjs';
import { UserRegister } from './user';
import { HttpErrorHandler, HandleError } from '../../../http-error-handler.service';
import { environment } from 'src/environments/environment.prod';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    Authorization: 'my-auth-token'
  })
};

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  usersUrl = `${environment.apiUrl}/login/add`;  // URL to web api
    private handleError: HandleError;
  
    constructor(
      private http: HttpClient,
      httpErrorHandler: HttpErrorHandler) {
      this.handleError = httpErrorHandler.createHandleError('LoginService');
    }
  
    /** POST: add a new user to the database */
    addUser(userRegister: UserRegister): Observable<UserRegister> {
      return this.http.post<UserRegister>(`${this.usersUrl}`, userRegister, httpOptions)
        .pipe(
          catchError(this.handleError('addUser', userRegister))
        );
    }
  
}
