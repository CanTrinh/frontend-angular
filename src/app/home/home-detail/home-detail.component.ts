import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, } from '@angular/common';
import { PostService } from 'src/app/post/post.service';
import { ActivatedRoute } from '@angular/router';
import { SanitizeUrlService } from 'src/app/sanitize-url.service';
import { CommentsComponent } from '../../comments/comments.component';
import { SafeResourceUrl } from '@angular/platform-browser';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { jwtDecode } from "jwt-decode";
import { LoginService } from '../../features/auth/login/login.service';
import { Observable } from 'rxjs';


import Quill from 'quill';
import { QuillModule } from 'ngx-quill';
import MagicUrl from 'quill-magic-url';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { RichTextEditorComponent } from "../../shared/components/rich-text-editor/rich-text-editor.component";

// Đăng ký module tự nhận diện link
Quill.register('modules/magicUrl', MagicUrl);



@Component({
  selector: 'app-home-detail',
  standalone: true,
  imports: [CommonModule, CommentsComponent, SafeHtmlPipe, QuillModule, FormsModule, ReactiveFormsModule, RichTextEditorComponent],
  templateUrl: './home-detail.component.html',
  styleUrls: ['./home-detail.component.css']
})
export class HomeDetailComponent implements OnInit {
  post: any;
  postForm!: FormGroup;
  editForm!: FormGroup;
  isAuthor: boolean;
  currentUserId: string;
  safeYoutubeUrl: SafeResourceUrl | null = null;
  isShorts = false;

  isEditing = false;
  linkPreview: any = null;
  editTitle = '';
  editContent = '';
  // post-detail.component.ts
  cloudFrontUrl = "https://cdn.ctlife.xyz"; // Lấy từ biến môi trường hoặc config


  constructor(
    private postService: PostService,
    private sanitizeService: SanitizeUrlService, // Inject service của bạn
    private route: ActivatedRoute,
    private loginService: LoginService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.postService.getPost(id).subscribe(data => {
        this.post = data;
        
        // 📺 Nếu là YouTube, xử lý link để nhúng
        if (this.post.type === 'YOUTUBE' && this.post.mediaUrl) {
           // 1. Kiểm tra xem có phải link Shorts không
          this.isShorts = this.post.mediaUrl.includes('/shorts/');
          // 2. Trích xuất ID và sanitize như cũ
          const videoId = this.extractYouTubeId(this.post.mediaUrl);
           if (videoId) {
          // Nhúng vào Iframe chuẩn (YouTube tự động nhận diện nếu là Shorts)
          this.safeYoutubeUrl = this.sanitizeService.sanitizeResourceUrl(
            `https://www.youtube.com/embed/${videoId}`
          );
        }
        }
      });
    }
  }

    // Hàm hỗ trợ chuyển link thường sang link embed
  private convertToEmbedUrl(url: string): string {
    const id = url.split('v=')[1] || url.split('/').pop();
    return `https://www.youtube.com{id}`;
  }

  private extractYouTubeId(url: string): string {
      // Regex này bắt được cả: watch?v=ID, youtu.be/ID, và shorts/ID
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?v=)|(shorts\/))([^#\&\?]{11}).*/;
      const match = url.match(regExp);
      
      // ID YouTube luôn có độ dài 11 ký tự
      return (match && match[8].length === 11) ? match[8] : '';
  }

isOwner(post: any): boolean { 
    const token = this.loginService.getToken();
    if (token) {
      const decoded: any = jwtDecode(token);
      this.currentUserId = decoded.sub; // hoặc decoded.sub tùy cấu trúc token của bạn
    }

    return post.author.id === this.currentUserId? true : false;
    
}

// Hàm kích hoạt chế độ sửa
onEdit() {
  this.isEditing = true;
  // Copy dữ liệu gốc sang biến tạm
  this.editTitle = this.post.title;
  this.editContent = this.post.content;
}

// Hàm lưu thay đổi
onSave() {
  const payload = {
    title: this.editTitle,
    content: this.editContent,
    // Giữ nguyên hoặc cập nhật linkPreview nếu logic quét link vẫn chạy
    linkPreview: this.linkPreview 
  };

  this.postService.updatePost(this.post.id, payload).subscribe(res => {
    this.post = res; // Cập nhật lại dữ liệu hiển thị
    this.isEditing = false; // Tắt editor
    this.linkPreview = null; // Reset preview tạm
  });
}

onDelete(postId: string) {
    if (confirm('Bạn có chắc muốn xóa bài viết này?')) {
      this.postService.deletePost(postId).subscribe(() => {
        //this.posts.splice(index, 1); // Xóa khỏi UI
      });
    }
  }

// Hàm hủy bỏ
onCancel() {
  this.isEditing = false;
  this.linkPreview = null; // Xóa preview nháp nếu có
}

  toggleEdit(): void {
    
  }

  onUpdate(): void {
    
  }

handleEditorChange(html: string) {
  this.postForm.patchValue({ content: html }, { emitEvent: false }); // Thêm { emitEvent: false } để tối ưu
  this.postForm.get('content')?.markAsTouched();
}



}
