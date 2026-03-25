import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from './english';
import { EnglishService } from './english.service';
import Quill from 'quill';
import { QuillModule } from 'ngx-quill';


@Component({
  standalone: true,
  selector: 'app-enlish',
  templateUrl: './english.component.html',
  imports: [ CommonModule, FormsModule,ReactiveFormsModule, QuillModule],
  providers: [EnglishService],
  styleUrls: ['./english.component.css']
})
export class EnglishComponent implements OnInit {
  

  postForm!: FormGroup;
  selectedFiles: File[] = []; // Lưu file thực tế để gửi lên NestJS
  isUploading = false;

  // Cấu hình Toolbar cho Quill (giống các forum)
  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],        
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image', 'video'], 
      ['clean']                                         
    ]
  };

  constructor(private fb: FormBuilder, private englishService: EnglishService) {}

  ngOnInit() {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required]] // Quill sẽ tự binding vào đây
    });
  }

  // Xử lý kéo thả/paste ảnh trực tiếp vào Editor
  addDragAndDrop(quill: Quill) {
    const nativeEditor = quill.root;
    
    nativeEditor.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.files.length) {
        this.handleInlineImage(e.dataTransfer.files[0], quill);
      }
    });

    nativeEditor.addEventListener('paste', (e: ClipboardEvent) => {
      if (e.clipboardData?.files.length) {
        this.handleInlineImage(e.clipboardData.files[0], quill);
      }
    });
  }

  // Upload ảnh lẻ khi kéo thả vào editor (giống VOZ)
  handleInlineImage(file: File, quill: Quill) {
    const formData = new FormData();
    formData.append('file', file);

    this.englishService.uploadSingleMedia(formData).subscribe(res => {
      const range = quill.getSelection();
      quill.insertEmbed(range ? range.index : 0, 'image', res.url);
    });
  }

  // Hàm Submit tổng thể
  onSubmit() {
    if (this.postForm.invalid) return;

    this.isUploading = true;
    const formData = new FormData();

    // 1. Đưa dữ liệu Text/HTML vào FormData
    formData.append('title', this.postForm.get('title')?.value);
    formData.append('content', this.postForm.get('content')?.value); // Đây là chuỗi HTML từ Quill

    // 2. Nếu bạn có thêm input file riêng bên ngoài editor (nếu cần)
    this.selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    // 3. Gửi lên NestJS
    /*this.englishService.createPost(formData).subscribe({
      next: (res) => {
        console.log('Đăng bài thành công!', res);
        this.isUploading = false;
        // Chuyển trang hoặc reset form tại đây
      },
      error: (err) => {
        this.isUploading = false;
        alert('Lỗi khi đăng bài!');
      }
    });
  
  }*/
}
}
