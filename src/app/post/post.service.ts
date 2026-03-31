import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { CreatePostDto} from './dto/createPost.dto';
import { environment } from 'src/environments/environment.prod';
import { HttpErrorHandler, HandleError } from '../http-error-handler.service';

@Injectable({ providedIn: 'root' })
export class PostService {
  // Example: store current user info (could come from AuthService)
  currentUserId = 1;
  userRole = 'USER';

  private apiUrl = `${environment.apiUrl}/posts`; // NestJS backend
  private apiUrlLink = `${environment.apiUrl}`;
  private UPLOAD_URL = `${environment.apiUrl}/media`; 
  //vi standalone nen ta inject thay vi dua vao constructor
  private http = inject(HttpClient);
  //private errorHandler = inject(HttpErrorHandler);
  //private handleError: HandleError;

  /*constructor() {
    // Khởi tạo handler riêng cho PostService
    this.handleError = this.errorHandler.createHandleError('PostService');
  }*/

  uploadMedia(formData: FormData): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(this.UPLOAD_URL, formData);
  }

  // 1. Lấy Metadata từ URL (Giai đoạn 1)
  getLinkMetadata(url: string): Observable<any> {
    // Chỉ cần gọi trực tiếp, nếu lỗi Interceptor sẽ tự hiện Message
    return this.http.post(`${this.apiUrlLink}/link-preview`, { url });
    /*
    return this.http.post(`${this.apiUrl}/link-preview`, { url })
    .pipe(
      // Nếu lỗi, trả về null và thông báo qua MessageService (đã code trong handler)
      catchError(this.handleError('getLinkMetadata', null))
    );*/
  }

  // Helper: Trích xuất URL từ chuỗi văn bản
  extractUrl(text: string): string | null {
    const urlRegEx = /(https?:\/\/[^\s]+)/g;
    const match = text.match(urlRegEx);
    return match ? match[0] : null;
  }

  createPost(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}`, formData);
    /*.pipe(
      // Nếu lỗi, trả về object rỗng hoặc error tùy ý
      catchError(this.handleError('createPost', null))
    );*/
  }

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
