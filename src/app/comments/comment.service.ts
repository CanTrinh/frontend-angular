// comment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateCommentDto } from './dto/createComment.dto';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private apiUrl = 'http://localhost:3000/posts';

  constructor(private http: HttpClient) {}

  getComments(postId: number) {
    return this.http.get<any[]>(`${this.apiUrl}/${postId}/comments`);
  }

  createComment(postId: number, commentData: CreateCommentDto) {
    
    return this.http.post<any>(`${this.apiUrl}/${postId}/comments`, commentData);
  }
}
