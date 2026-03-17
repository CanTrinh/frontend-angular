import { Component, Input } from '@angular/core';
//import { CdkDrag} from '@angular/cdk/drag-drop'
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PostService } from './post.service';
import { DatePipe, NgFor, NgIf, NgForOf, } from '@angular/common';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MessageService } from '../message.service';




@Component({
  selector: 'app-post',
  standalone:true,
  imports: [ReactiveFormsModule,NgIf ],
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent {

  postForm!: FormGroup;
  linkPreview: any = null; // Chứa data từ NestJS
  isScanning = false;

  constructor(private fb: FormBuilder, 
    private postService: PostService,
    private messageService: MessageService,
    private router: Router) {
       // Initialize Reactive Form
      this.postForm = this.fb.group({
        title: ['', [Validators.required, Validators.maxLength(100)]],
        content: ['', [Validators.required, Validators.maxLength(5000)]],
        mediaUrl: ['']
      });

    }

  ngOnInit(): void {
     // Theo dõi Content để tự động bắt link
    this.postForm.get('content')?.valueChanges.pipe(
      debounceTime(800),
      distinctUntilChanged()
    ).subscribe(text => {
      const url = this.postService.extractUrl(text);
      if (url && (!this.linkPreview || url !== this.linkPreview.url)) {
        this.fetchMetadata(url);
      }
    });
  }

  fetchMetadata(url: string) {
  this.isScanning = true;
  
  this.postService.getLinkMetadata(url).subscribe({
    next: (res) => {
      // 1. Kiểm tra nếu có dữ liệu metadata thực sự (ít nhất phải có title)
      if (res && res.title) {
        this.linkPreview = res;
        
        // Tự điền vào ô Media URL nếu ô đó đang trống
        if (!this.postForm.get('mediaUrl')?.value) {
          this.postForm.patchValue({ mediaUrl: url }, { emitEvent: false });
        }
      } else {
        // 2. Trường hợp trả về 200 OK nhưng data rỗng (link rác/không có meta)
        this.linkPreview = null;
        this.messageService.add('⚠️ Link này không hỗ trợ bản xem trước.');
      }
      this.isScanning = false;
    },
    error: (err) => {
      // 3. Trường hợp lỗi 404/500: errorInterceptor trong main.ts sẽ tự hiện thông báo
      this.linkPreview = null;
      this.isScanning = false;
    }
  });
}

  // Submit handler
  onSubmit(): void {
    if (this.postForm.valid) {
      const postPayload = {
        ...this.postForm.value,
        metadata: this.linkPreview // Ép metadata vào đây để gửi lên NestJS
      };
      this.postService.createPost(postPayload).subscribe({
        next: (res) => {
          console.log('Post created successfully:', res);

          // 1. Reset Form để tránh user bấm nút gửi 2 lần
        this.postForm.reset(); 
        
        // 2. Xóa biến tạm preview để các bài đăng sau không bị dính ảnh cũ
        this.linkPreview = null; 
        
        // 3. Hiện thông báo thành công "sống động" qua MessageService
        this.messageService.add('🎉 Bài viết của bạn đã được xuất bản!');

        // 4. Điều hướng sang trang chi tiết để xem bài vừa đăng
        // Dùng tham số 'res.id' nhận về từ NestJS/Prisma
        this.router.navigate(['/posts', res.id]);
          
        },
        error: (err) => {
          console.error('Error creating post:', err);
        }
      });
    }
  }


  @Input() post: any; // post object passed from parent (feed component)
  showComments = false;

  // Toggle comments visibility
  toggleComments(postId: number): void {
    this.showComments = !this.showComments;
    if (this.showComments && !this.post.comments) {
      this.postService.getComments(postId).subscribe({
        next: (comments) => (this.post.comments = comments),
        error: (err) => console.error('Error loading comments:', err)
      });
    }
  }

  // Like post
  likePost(postId: number): void {
    this.postService.likePost(postId).subscribe({
      next: (updatedPost) => (this.post.likes = updatedPost.likes),
      error: (err) => console.error('Error liking post:', err)
    });
  }

  // Edit post (could open a modal or navigate)
  editPost(postId: number): void {
    console.log('Edit post:', postId);
    // implement navigation or modal here
  }

  // Delete post
  deletePost(postId: number): void {
    this.postService.deletePost(postId).subscribe({
      next: () => console.log('Post deleted'),
      error: (err) => console.error('Error deleting post:', err)
    });
  }

  // Permissions (example logic)
  canEdit(post: any): boolean {
    return post.user.id === this.postService.currentUserId;
  }

  canDelete(post: any): boolean {
    return post.user.id === this.postService.currentUserId || this.postService.isAdmin();
  }




  

}
