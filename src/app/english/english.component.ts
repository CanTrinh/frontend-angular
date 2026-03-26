import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from './english';
import { EnglishService } from './english.service';

//import * as QuillNamespace from 'quill';// doi voi phien ban cu
//const Quill: any = QuillNamespace; // Ép kiểu để tránh lỗi namespace

import Quill from 'quill';
import { QuillModule } from 'ngx-quill';
import MagicUrl from 'quill-magic-url';

// Đăng ký module tự nhận diện link
Quill.register('modules/magicUrl', MagicUrl);


@Component({
  standalone: true,
  selector: 'app-enlish',
  templateUrl: './english.component.html',
  imports: [ CommonModule, FormsModule,ReactiveFormsModule, QuillModule],
  styleUrls: ['./english.component.css']
})
export class EnglishComponent {
  quillInstance: any; 
  constructor(private englishService: EnglishService){}

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

  // 1. XỬ LÝ KÉO THẢ & PASTE ẢNH (NHƯ ĐÃ NÓI Ở TRÊN)
addDragAndDrop(quill: any) {
  const editor = quill.root;

  // Định nghĩa kiểu DragEvent cho tham số 'e'
  editor.addEventListener('drop', (e: DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      this.uploadAndInsert(files[0], quill); // Truyền file đầu tiên
    }
  });

  // Định nghĩa kiểu ClipboardEvent cho tham số 'e'
  editor.addEventListener('paste', (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault(); // Chặn paste mặc định (tránh paste base64)
            this.uploadAndInsert(file, quill);
          }
        }
      }
    }
  });
}


 // 1. Hàm này kích hoạt khi nhấn nút Image trên toolbar
triggerFileSelect() {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');
  input.click();

  input.onchange = () => {
    const file = input.files ? input.files[0] : null;
    if (file) {
      // 2. Thay vì dán Base64, mình đem file này đi UPLOAD LẺ lên NestJS
      this.uploadAndInsert(file, this.quillInstance);
    }
  };
}

// 3. Hàm upload (dùng chung cho cả Drag & Drop và Chọn file thủ công)
private uploadAndInsert(file: File, quill: any) {
  const formData = new FormData();
  formData.append('file', file);

  this.englishService.uploadMedia(formData).subscribe(res => {
    const range = quill.getSelection(true);
    // 4. Dán cái LINK URL từ S3/Cloudfront vào nội dung
    quill.insertEmbed(range.index, 'image', res.url);
    quill.setSelection(range.index + 1);
  });
}


  // 2. XỬ LÝ LINK YOUTUBE & LINK BÁO
  // Mẹo: Quill mặc định khi bạn paste link YouTube vào nút "Video", 
  // nó sẽ tự chuyển thành iframe. Để tự động hơn:
  
  onContentChange(event: any) {
    const html = event.html;
    // Bạn có thể dùng Regex ở đây để quét nếu thấy link YouTube thuần 
    // thì gợi ý người dùng hoặc tự chuyển thành mã nhúng.
  }

}

  