import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { BehaviorSubject, Observable, catchError, map, tap } from 'rxjs';
import { UserSignIn } from './dto/loginUser';
//import { HttpErrorHandler, HandleError } from '../../../http-error-handler.service';
import { RegisterUser } from './dto/registerUser.dto';
import { Router } from '@angular/router';

export const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    Authorization: 'my-auth-token'
  })
};

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  loginUrl = 'http://localhost:3000/auth/login';  // URL to web api
  registerUrl = 'http://localhost:3000/user/register';
  //private handleError: HandleError;
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();
  
  constructor(
      private http: HttpClient,
      private router: Router,
      //httpErrorHandler: HttpErrorHandler
      ) {
      //this.handleError = httpErrorHandler.createHandleError('LoginService');
  }
  
    
    signINUser(userSignIn: UserSignIn): Observable<UserSignIn> {
      return this.http.post<UserSignIn>(`${this.loginUrl}`, userSignIn, httpOptions)

        .pipe(
          //catchError(this.handleError('signInUser', userSignIn))
          tap(res =>{
            localStorage.setItem('token', res.access_token);
            localStorage.setItem('user', JSON.stringify(res.userInfor));
            this.userSubject.next(res.userInfor);

          })

        );
    }

    getToken(): string | null { 
      return localStorage.getItem('token');
   }

   isLoggedIn(): boolean { 
    const token = this.getToken(); 
    return !!token; // true if token exists 
    }

  loadUserFromStorage() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.userSubject.next(JSON.parse(savedUser));
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
    this.userSubject.next(null);
  }


    registerUser(registerUser: RegisterUser):Observable<RegisterUser>
    {
      return this.http.post<RegisterUser>(`${this.registerUrl}`, registerUser, httpOptions)
       /* .pipe(
          catchError(this.handleError('registerUser', registerUser))
        );*/
    }
  
}
