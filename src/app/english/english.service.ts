import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class EnglishService {
  private readonly API_URL = `${environment.apiUrl}/s3/posts`;
  private readonly UPLOAD_URL = `${environment.apiUrl}/s3/image`;

  constructor(private http: HttpClient) {}

  // Lấy danh sách bài viết
  getPosts(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL);
  }

  // Upload ảnh lẻ khi kéo thả (Trả về { url: string })
  uploadMedia(formData: FormData): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(this.UPLOAD_URL, formData);
  }

  // Tạo bài viết mới (JSON)
  createPost(data: any): Observable<any> {
    return this.http.post(this.API_URL, data);
  }

  // Cập nhật bài viết (JSON)
  updatePost(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.API_URL}/${id}`, data);
  }

  // Xóa bài viết
  deletePost(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}
