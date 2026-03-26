import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EnglishService } from './english.service';

//import * as QuillNamespace from 'quill';// doi voi phien ban cu
//const Quill: any = QuillNamespace; // Ép kiểu để tránh lỗi namespace
import { SafeHtmlPipe } from '../pipes/safe-html.pipe';
import Quill from 'quill';
import { QuillModule } from 'ngx-quill';
import MagicUrl from 'quill-magic-url';

// Đăng ký module tự nhận diện link
Quill.register('modules/magicUrl', MagicUrl);


@Component({
  standalone: true,
  selector: 'app-enlish',
  templateUrl: './english.component.html',
  imports: [ CommonModule, FormsModule,ReactiveFormsModule, QuillModule,SafeHtmlPipe ],
  styleUrls: ['./english.component.css']
})
export class EnglishComponent implements OnInit{
  posts: any[] = [];
  createForm!: FormGroup;
  editForm!: FormGroup;
  
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

  constructor(private fb: FormBuilder, private englishService: EnglishService) {}

  ngOnInit() {
    this.initForms();
    this.loadPosts();
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




  