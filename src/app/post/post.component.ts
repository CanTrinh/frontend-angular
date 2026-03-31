import { Component, Input } from '@angular/core';
//import { CdkDrag} from '@angular/cdk/drag-drop'
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PostService } from './post.service';
import { DatePipe, NgFor, NgIf, NgForOf, } from '@angular/common';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MessageService } from '../message.service';

import Quill from 'quill';
import { QuillModule } from 'ngx-quill';
import MagicUrl from 'quill-magic-url';


// Đăng ký module tự nhận diện link
Quill.register('modules/magicUrl', MagicUrl);



@Component({
  selector: 'app-post',
  standalone:true,
  imports: [ReactiveFormsModule,NgIf, NgFor, QuillModule,  ],
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent {

  postForm!: FormGroup;
  editForm!: FormGroup;

  linkPreview: any = null; // Chứa data từ NestJS
  isScanning = false;

  //selectedMedia: { file: File, previewUrl: any, type: string }[] = [];

  isUploading = false;
  editingPostId: string | null = null;
  isUpdating = false ;

  draftId: string = crypto.randomUUID();

  private currentQuillInstance: any;

  constructor(private fb: FormBuilder, 
    private postService: PostService,
    private messageService: MessageService,
    private router: Router) {
       // Initialize Reactive Form
      this.postForm = this.fb.group({
        title: ['', [Validators.required, Validators.maxLength(100)]],
        content: ['', [Validators.required, Validators.maxLength(5000)]],
        mediaUrl: [''],

        type: ['TEXT'], // Mặc định là TEXT, sẽ tự cập nhật thành MEDIA/YOUTUBE...
        metadata: [null] 
      });

    }

  quillConfig = {
    magicUrl: true, // Tự động biến link text thành thẻ <a>
    toolbar: {
      container: [
        ['bold', 'italic', 'underline'],
        ['link', 'image', 'video'], // 'video' mặc định của Quill hỗ trợ nhúng YouTube
        ['clean']
      ],
      handlers: {
        // Ghi đè handler mặc định của nút 'image' nếu muốn chọn file thủ công
        image: () => this.triggerFileSelect() 
      }
    }
  };

   // --- XỬ LÝ MEDIA TRONG QUILL ---
  addDragAndDrop(quill: any) {
    this.currentQuillInstance = quill;
    const editor = quill.root;
    
    editor.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.files.length) this.handleUpload(e.dataTransfer.files[0]);
    });

    editor.addEventListener('paste', (e: ClipboardEvent) => {
      const file = e.clipboardData?.files[0];
      if (file?.type.startsWith('image/')) {
        e.preventDefault();
        this.handleUpload(file);
      }
    });
  }

  triggerFileSelect() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = "image/*,video/*" ;
    if (input.size > 20 * 1024 * 1024) {
          alert(`File ${input.name} quá lớn!`);
    }
    input.click();
    input.onchange = () => {
      if (input.files?.length) this.handleUpload(input.files[0]);
    };
  }

  private handleUpload(file: File) {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const formData = new FormData();

    //this.draftId = crypto.randomUUID();

    formData.append('draftId', this.draftId)
    formData.append('file', file);

    this.postService.uploadMedia(formData).subscribe(res => {
      const range = this.currentQuillInstance.getSelection(true);
      const index = range ? range.index : 0;

      if(isImage){
        this.currentQuillInstance.insertEmbed(index, 'image', res.url);
        this.currentQuillInstance.setSelection(index + 1);
      }else if(isVideo) {
        // Chèn video vào vị trí con trỏ
        this.currentQuillInstance.insertEmbed(index, 'video', res.url);
        this.currentQuillInstance.setSelection(index + 1);
      }
    });
  }

   // --- LOGIC SỬA TẠI CHỖ ---
  enableEdit(post: any) {
    this.editingPostId = post.id;
    this.editForm.patchValue({
      title: post.title,
      content: post.content
    });
  }

  // --- LOGIC XÓA ---
  onDelete(postId: number, index: number) {
    if (confirm('Bạn có chắc muốn xóa bài viết này?')) {
      this.postService.deletePost(postId).subscribe(() => {
        this.post.splice(index, 1); // Xóa khỏi UI
      });
    }
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
  /*
  onFileChange(event: any) {
  const files = event.target.files;
    if (files) {
      for (let file of files) {
        // Kiểm tra dung lượng (ví dụ < 20MB)
        if (file.size > 20 * 1024 * 1024) {
          alert(`File ${file.name} quá lớn!`);
          continue;
        }

        const reader = new FileReader();
        const isVideo = file.type.startsWith('video');

        // Tạo URL xem trước
        const previewUrl = URL.createObjectURL(file);
        
        this.selectedMedia.push({
          file: file,
          previewUrl: previewUrl,
          type: isVideo ? 'video' : 'image'
        });
      }
    }
      // Reset input để có thể chọn lại cùng 1 file nếu vừa xóa
      event.target.value = ''; 
  }

  removeSelectedFile(index: number) {
    // Thu hồi bộ nhớ của URL tạm thời để tránh tràn bộ nhớ trình duyệt
    URL.revokeObjectURL(this.selectedMedia[index].previewUrl);
    this.selectedMedia.splice(index, 1);
  }
  */


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
  async onSubmit() {
    
    this.isUploading = true;

    // 1. Khởi tạo FormData thay vì Plain Object
    const formData = new FormData();

    // 2. Thêm các trường text cơ bản
    formData.append('title', this.postForm.value.title);
    formData.append('content', this.postForm.value.content);
    formData.append('mediaUrl', this.postForm.value.mediaUrl || '');
    formData.append('draftId', this.draftId);
    //formData.append('type', this.postForm.get('type')?.value || 'TEXT');

    // 3. Thêm Metadata (Link Preview) dưới dạng chuỗi JSON
    if (this.linkPreview) {
      formData.append('metadata', JSON.stringify(this.linkPreview));
    }

    // 4. Thêm các file thực tế (Ảnh/Video) đã chọn từ mảng selectedMedia
   /* this.selectedMedia.forEach((item) => {
      formData.append('files', item.file); // 'files' phải khớp với tên trong NestJS FilesInterceptor
    });
    */
      
      this.postService.createPost(formData).subscribe({
        next: (res) => {
          console.log('Post created successfully:', res);

          this.resetForm();
          this.isUploading = false;
        
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

  // Đừng quên dọn dẹp sau khi đăng hoặc xóa
  resetForm() {
    this.postForm.reset();
    //this.selectedMedia.forEach(m => URL.revokeObjectURL(m.previewUrl)); // Giải phóng bộ nhớ
    //this.selectedMedia = [];
    this.linkPreview = null;
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



  isOwner(post: any) { return true; /* Logic kiểm tra user hiện tại */ }
  

}
