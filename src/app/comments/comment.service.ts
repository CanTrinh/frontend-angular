// comment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { CreateCommentDto } from './dto/createComment.dto';
import { environment } from '../../environments/environment.prod';
import { IS_PUBLIC_API } from '../authentication/http-context';


@Injectable({ providedIn: 'root' })
export class CommentService {
  private apiUrl = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) {}

  getComments(postId: string) {
    return this.http.get<any[]>(`${this.apiUrl}/${postId}/comments`, {context: new HttpContext().set(IS_PUBLIC_API, true)});
  }

  createComment(postId: string, commentData: CreateCommentDto) {
    
    return this.http.post<any>(`${this.apiUrl}/${postId}/comments`, commentData);
  }
}
