import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class QuillEditorService {
  
  private readonly UPLOAD_URL = `${environment.apiUrl}/media`;
  private http = inject(HttpClient);
  //constructor(private http: HttpClient) { }

  getModuleConfig(){
   return  {
      magicUrl: true, // Tự động biến link text thành thẻ <a>
      toolbar: {
        container: [
          ['bold', 'italic', 'underline'],
          ['link', 'image', 'video'], // 'video' mặc định của Quill hỗ trợ nhúng YouTube
          ['clean']
        ],
        /*handlers: {
          // Ghi đè handler mặc định của nút 'image' nếu muốn chọn file thủ công
          image: () => this.triggerFileSelect() 
        }*/
      }
    };
  }


  handleUploadApi(file: File, draftId: string): Observable<string>{
    const formData = new FormData();
    formData.append('file', file);
    formData.append('draftId', draftId);
      
    return this.http.post<{ url: string }>(this.UPLOAD_URL, formData).pipe(
      map(res => res.url)
    );
  }
}


  







