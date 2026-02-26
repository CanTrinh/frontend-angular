import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { CreatePostDto} from './dto/createPost.dto';
import { HttpErrorHandler, HandleError } from '../http-error-handler.service';

@Injectable({ providedIn: 'root' })
export class PostService {
  /*
  private apiUrl = 'http://localhost:3000/posts';
  private handleError: HandleError;

 constructor(
      private http: HttpClient,
      httpErrorHandler: HttpErrorHandler) {
      this.handleError = httpErrorHandler.createHandleError('HomeService');
  }

  createPost(postData: PostDto): Observable<PostDto> {
    return this.http.post<PostDto>(this.apiUrl, postData)
     .pipe(
          catchError(this.handleError('postData', postData))
    );
  }
  */


  private apiUrl = 'http://localhost:3000/posts'; // NestJS backend

  constructor(private http: HttpClient) {}

  createPost(postData: CreatePostDto): Observable<any> {
    return this.http.post(this.apiUrl, postData);
  }


  // Example: store current user info (could come from AuthService)
  currentUserId = 1;
  userRole = 'USER';

  // Get all posts
  getPosts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  //get post by id

  getPost(id: number): Observable<any> {
     return this.http.get<any>(`${this.apiUrl}/${id}`); 
  }

  // Get comments for a post
  getComments(postId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${postId}/comments`);
  }

  // Like a post
  likePost(postId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${postId}/like`, {});
  }

  // Delete a post
  deletePost(postId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${postId}`);
  }

  // Permission helpers
  isAdmin(): boolean {
    return this.userRole === 'ADMIN';
  }




}
