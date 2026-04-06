// comment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateCommentDto } from './dto/createComment.dto';
import { environment } from '../../environments/environment.prod';


@Injectable({ providedIn: 'root' })
export class CommentService {
  private apiUrl = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) {}

  getComments(postId: string) {
    return this.http.get<any[]>(`${this.apiUrl}/${postId}/comments`);
  }

  createComment(postId: string, commentData: CreateCommentDto) {
    
    return this.http.post<any>(`${this.apiUrl}/${postId}/comments`, commentData);
  }
}
