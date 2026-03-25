import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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

  ngOnInit(): void {
    
  }

  constructor(
    private englishService: EnglishService
  ){

  }

  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline'],        // Chữ đậm, nghiêng
      ['link', 'image', 'video'],             // Chèn link, ảnh, video
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']                               // Xóa định dạng
    ]
  };

  // Hàm này chạy ngay khi Editor sẵn sàng
  addDragAndDrop(quill: Quill) {
    const nativeEditor = quill.root;

    // Bắt sự kiện Drop (Kéo thả)
    nativeEditor.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        this.handleImageUpload(e.dataTransfer.files, quill);
      }
    });

    // Bắt sự kiện Paste (Dán ảnh từ clipboard - giống VOZ)
    nativeEditor.addEventListener('paste', (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        this.handleImageUpload(e.clipboardData.files, quill);
      }
    });
  }

  handleImageUpload(files: FileList, quill: Quill) {
    const file = files[0];
    if (!file.type.startsWith('image/')) return;

    // 1. Gửi file lên NestJS ngay lập tức
    const formData = new FormData();
    formData.append('file', file);

    this.englishService.uploadSingleFile(formData).subscribe(res => {
      // 2. Lấy URL từ server trả về (ví dụ: res.url)
      const range = quill.getSelection();
      // 3. Chèn ảnh vào đúng vị trí con trỏ
      quill.insertEmbed(range ? range.index : 0, 'image', res.url);
    });
  }
}

