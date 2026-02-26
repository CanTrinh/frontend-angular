import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';


import { Observable, catchError, map } from 'rxjs';

import { User } from './english';
import { HttpErrorHandler, HandleError } from '../http-error-handler.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    Authorization: 'my-auth-token'
  })
};

@Injectable()
export class EnglishService {
  usersUrl = 'http://localhost:3000/users';  // URL to web api
  private handleError: HandleError;

  constructor(
    private http: HttpClient,
    httpErrorHandler: HttpErrorHandler) {
    this.handleError = httpErrorHandler.createHandleError('HeroesService');
  }

  /** GET heroes from the server */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.usersUrl)
      .pipe(
        catchError(this.handleError('getUsers', []))
      );
  }

  /* GET heroes whose name contains search term */
  searchUsers(term: string): Observable<User[]> {
    term = term.trim();

    // Add safe, URL encoded search parameter if there is a search term
    const options = term ?
     { params: new HttpParams().set('name', term) } : {};

    return this.http.get<User[]>(this.usersUrl, options)
      .pipe(
        catchError(this.handleError<User[]>('searchUsers', []))
      );
  }

  // This JSONP example doesn't run. It is for the JSONP documentation only.
  /** Imaginary API in a different domain that supports JSONP. */
  usersSearchUrl = 'http://localhost:3000/users';

  /** Does whatever is necessary to convert the result from API to Heroes */
  jsonpResultToUsers(result: any) { return result as User[]; }

  /* GET heroes (using JSONP) whose name contains search term */
  searchUsersJsonp(term: string): Observable<User[]> {
    term = term.trim();

    const usersUrl = `${this.usersSearchUrl}?${term}`;
    return this.http.jsonp(usersUrl, 'callback')
      .pipe(
        map(result => this.jsonpResultToUsers(result)),
        catchError(this.handleError('searchUsers', []))
      );
  }

  //////// Save methods //////////

  /** POST: add a new hero to the database */
  addUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.usersUrl}/add`, user, httpOptions)
      .pipe(
        catchError(this.handleError('addUser', user))
      );
  }

  /** DELETE: delete the hero from the server */
  deleteUser(id: number): Observable<unknown> {
    const url = `${this.usersUrl}/${id}`; // DELETE api/heroes/42
    return this.http.delete(url, httpOptions)
      .pipe(
        catchError(this.handleError('deleteUser'))
      );
  }

  /** PUT: update the hero on the server. Returns the updated hero upon success. */
  updateUser(user: User): Observable<User> {
    httpOptions.headers =
      httpOptions.headers.set('Authorization', 'my-new-auth-token');

    return this.http.put<User>(`${this.usersUrl}/${user.id}/update`, user, httpOptions)
      .pipe(
        catchError(this.handleError('updateUser', user))
      );
  }
}
