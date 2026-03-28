import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EnglishService } from './english.service';
import { PostService } from '../post/post.service';
import { MessageService } from '../message.service';

//import * as QuillNamespace from 'quill';// doi voi phien ban cu
//const Quill: any = QuillNamespace; // Ép kiểu để tránh lỗi namespace
import { SafeHtmlPipe } from '../pipes/safe-html.pipe';
import Quill from 'quill';
import { QuillModule } from 'ngx-quill';
import MagicUrl from 'quill-magic-url';
import { debounceTime, distinctUntilChanged } from 'rxjs';

// Đăng ký module tự nhận diện link
Quill.register('modules/magicUrl', MagicUrl);


@Component({
  standalone: true,
  selector: 'app-enlish',
  templateUrl: './english.component.html',
  imports: [ CommonModule, FormsModule,ReactiveFormsModule, QuillModule,SafeHtmlPipe ],
  styleUrls: ['./english.component.css']
})
export class EnglishComponen {
  posts: any[] = [];
  createForm!: FormGroup;
  editForm!: FormGroup;

  linkPreview: any = null; // Chứa data từ NestJS
  isScanning = false;
  
  editingPostId: string | null = null;
  isUploading = false;
  isUpdating = false;

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


  private currentQuillInstance: any;

  constructor(private fb: FormBuilder, 
    private englishService: EnglishService,
    private postService: PostService,
    private messageService: MessageService) {}

  ngOnInit() {
    this.initForms();
    this.loadPosts();

     // Theo dõi Content để tự động bắt link
        this.createForm.get('content')?.valueChanges.pipe(
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
        /*if (!this.createForm.get('mediaUrl')?.value) {
          this.createForm.patchValue({ mediaUrl: url }, { emitEvent: false });
        }*/
      } else {
        // 2. Trường hợp trả về 200 OK nhưng data rỗng (link rác/không có meta)
        this.linkPreview = null;
        this.messageService.add('⚠️ Link này không hỗ trợ bản xem trước.');
      }
      this.isScanning = false;
    },
    error: (err)=> {
      // 3. Trường hợp lỗi 404/500: errorInterceptor trong main.ts sẽ tự hiện thông báo
      this.linkPreview = null;
      this.isScanning = false;
    }
  });
}

  initForms() {
    this.createForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required]
    });
    this.editForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

  loadPosts() {
    this.englishService.getPosts().subscribe(data => this.posts = data);
  }

  // --- LOGIC TẠO MỚI ---
  onCreateSubmit() {
    if (this.createForm.invalid) return;
    this.isUploading = true;
    this.englishService.createPost(this.createForm.value).subscribe(newPost => {
      this.posts.unshift(newPost); // Thêm vào đầu danh sách ngay lập tức
      this.createForm.reset();
      this.isUploading = false;
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

  onUpdateSubmit(postId: string) {
    this.isUpdating = true;
    this.englishService.updatePost(postId, this.editForm.value).subscribe(updatedPost => {
      const index = this.posts.findIndex(p => p.id === postId);
      this.posts[index] = updatedPost; // Cập nhật mảng tại chỗ
      this.editingPostId = null;
      this.isUpdating = false;
    });
  }

  // --- LOGIC XÓA ---
  onDelete(postId: string, index: number) {
    if (confirm('Bạn có chắc muốn xóa bài viết này?')) {
      this.englishService.deletePost(postId).subscribe(() => {
        this.posts.splice(index, 1); // Xóa khỏi UI
      });
    }
  }

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
    input.accept = 'image/*';
    input.click();
    input.onchange = () => {
      if (input.files?.length) this.handleUpload(input.files[0]);
    };
  }

  private handleUpload(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    this.englishService.uploadMedia(formData).subscribe(res => {
      const range = this.currentQuillInstance.getSelection(true);
      this.currentQuillInstance.insertEmbed(range.index, 'image', res.url);
      this.currentQuillInstance.setSelection(range.index + 1);
    });
  }

  isOwner(post: any) { return true; /* Logic kiểm tra user hiện tại */ }
}




  