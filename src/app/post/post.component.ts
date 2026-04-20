import { Component, Input, ViewChild } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PostService } from './post.service';
import { DatePipe, NgFor, NgIf, NgForOf, } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService } from '../message.service';
import { NzSelectModule } from 'ng-zorro-antd/select'; 


import Quill from 'quill';
import {  QuillModule } from 'ngx-quill';
import MagicUrl from 'quill-magic-url';
import { RichTextEditorComponent } from '../shared/components/rich-text-editor/rich-text-editor.component';
import { CategoryDto } from '../shared/types/post.interface';
import { CategoryService } from '../category/category.service';


// Đăng ký module tự nhận diện link
Quill.register('modules/magicUrl', MagicUrl);



@Component({
  selector: 'app-post',
  standalone:true,
  imports: [ReactiveFormsModule, NgIf, QuillModule, RichTextEditorComponent,NzSelectModule ],
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent {

  postForm!: FormGroup;
  editForm!: FormGroup;

  categories: CategoryDto[];

  linkPreview: any = null; // Chứa data từ NestJS
  isScanning = false;
  lastUrl: string = '';

  //selectedMedia: { file: File, previewUrl: any, type: string }[] = [];

  isUploading = false;
  editingPostId: string | null = null;
  isUpdating = false ;

  draftId: string = crypto.randomUUID();

 
  initialContent = '';
  @ViewChild(RichTextEditorComponent) editor!: RichTextEditorComponent;
  constructor(private fb: FormBuilder, 
    private postService: PostService,
    private messageService: MessageService,
    private categoryService: CategoryService,
    private router: Router) {}

  

   ngOnInit(): void {

    // 1. Lấy tất cả categories cho dropdown
    this.categoryService.getCatergories().subscribe(cats => this.categories = cats);

    this.postForm = this.fb.group({
        title: ['', [Validators.required, Validators.maxLength(100)]],
        content: ['', [Validators.required, Validators.maxLength(5000)]],
        categoryNames: [[], [Validators.required, Validators.maxLength(2)]],
        mediaUrl: [''],

    });
  // Gán giá trị từ form vào biến này MỘT LẦN DUY NHẤT khi khởi tạo
  this.initialContent = this.postForm.get('content')?.value || '';
}

 handleEditorChange(html: string) {
  this.postForm.patchValue({ content: html }, { emitEvent: false }); // Thêm { emitEvent: false } để tối ưu
  this.postForm.get('content')?.markAsTouched();
}
 
  fetchMetadata(url: string |null) {

    this.isScanning = true;
    
    if(url && (url !== this.lastUrl)) {
      this.lastUrl = url;

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
    }else if(!url) {
      
      this.lastUrl = '';
      this.linkPreview = null;
      this.isScanning = false;
    }

}


  onRemovePreview(){
    //console.log(this.lastUrl);
    if(this.lastUrl){
      // goi ham xoa link ben trong quill editor
      this.editor.removeLinkFromContent(this.lastUrl);

      //xoa card preview tren post
      this.linkPreview = null;
      this.lastUrl= '';
    }
  }
  // Submit handler
  async onSubmit() {
    
    this.isUploading = true;
  //const htmlContent = this.editor.quillEditor.root.innerHTML;
  const payload = {
   ...this.postForm.value,
    draftId: this.draftId ,               // UUID string

    metadata: this.linkPreview ? {
      title: this.linkPreview.title,
      description: this.linkPreview.description,
      image: this.linkPreview.image,
      url: this.linkPreview.url
    } : null

  };
      
  console.log(payload.content);
      this.postService.createPost(payload).subscribe({
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
  toggleComments(postId: string): void {
    this.showComments = !this.showComments;
    if (this.showComments && !this.post.comments) {
      this.postService.getComments(postId).subscribe({
        next: (comments) => (this.post.comments = comments),
        error: (err) => console.error('Error loading comments:', err)
      });
    }
  }

  // Like post
  likePost(postId: string): void {
    this.postService.likePost(postId).subscribe({
      next: (updatedPost) => (this.post.likes = updatedPost.likes),
      error: (err) => console.error('Error liking post:', err)
    });
  }

  // Edit post (could open a modal or navigate)
  editPost(postId: string): void {
    console.log('Edit post:', postId);
    // implement navigation or modal here
  }

  // Delete post
  deletePost(postId: string): void {
    this.postService.deletePost(postId).subscribe({
      next: () => console.log('Post deleted'),
      error: (err) => console.error('Error deleting post:', err)
    });
  }


  isOwner(post: any) { return true; /* Logic kiểm tra user hiện tại */ }
  

}
