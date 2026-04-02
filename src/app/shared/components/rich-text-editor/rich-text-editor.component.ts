import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import Quill from 'quill';
import { QuillModule } from 'ngx-quill';
import MagicUrl from 'quill-magic-url';
import { QuillEditorService } from '../../../core/services/quill-editor.service';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment.prod';
import { debounce, debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';


// Đăng ký module tự nhận diện link
Quill.register('modules/magicUrl', MagicUrl);

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule, QuillModule, FormsModule],
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.css']
})
export class RichTextEditorComponent implements OnInit {

  // tao mot luong du lieu noi bo
  private contentSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  @Input() draftId!: string; // draftid lay tu post component
  @Input() content: string = '';
  @Input() placeholder: string = 'Bạn có thể chèn link báo/youtube, upload ảnh/video < 20mb, nhập text tại đây';

  @Output() contentChange = new EventEmitter<string>();
  @Output() linkDetected = new EventEmitter<string|null>();

  quillConfig: any;
  

  private currentQuillInstance: any; // luu lai instance cua quill de biet con tro dang o dau

  constructor(private quillService: QuillEditorService){}

  ngOnInit(): void {
    this.quillConfig = this.quillService.getModuleConfig();

    // cau hinh bo loc cho luong du lieu
    this.contentSubject.pipe(
      debounceTime(800), // doi 800ms sau khi ngung go moi xu ly
      distinctUntilChanged(), //chi chay neu noi dung khac lan truoc
      takeUntil(this.destroy$) // huy khi component bi dong
    ).subscribe(html => {
      // phat noi dung cuoi cung ve cho form cha
      this.contentChange.emit(html);

      // thuc hien bat link
      this.detectLink(html);
    })
  }

  onContentChanged(event: any) {
    /*if(event.html !== this.content){
      this.contentChange.emit(event.html);
    }*/
   // day du lieu text thuan vao pheu Subject thay vi xu ly ngay
   this.contentSubject.next(event.text);


  }

  private detectLink(html: string){
    // kiem tra neu text khong ton tai hoac khong phai chuoi
    if(!html || typeof html !== 'string'){
      this.linkDetected.emit(null);
      return;
    }
     // phat hien thay doi xem co link phai link url khong neu co gui ra tu output
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = html.match(urlRegex);

    if( matches && matches.length > 0) {
      const lastLink = matches[matches.length-1].trim();
      this.linkDetected.emit(lastLink);
    } else {
      this.linkDetected.emit(null);
    }
  }



  // phuong thuc xu ly cho viec nguoi dung chon tu nut image thay vi keo tha
  triggerFileSelect() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.click();
    input.onchange = () => {
      if (input.files?.length) this.handleUploadMedia(input.files[0]);
    };
  }

  //khi nguoi dung go hoac chen anh hay video boi hanh dong keo tha
  addDragAndDrop(quill: any) {
    this.currentQuillInstance = quill;
    const editor = quill.root;
    const toolbar = quill.getModuleConfig('toolbar');

    //ghi de hanh dong nut image
    toolbar.addHandler('image', () => {
      this.triggerFileSelect();
    })
    
    editor.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.files.length) this.handleUploadMedia(e.dataTransfer.files[0]);
    });

    editor.addEventListener('paste', (e: ClipboardEvent) => {
      const file = e.clipboardData?.files[0];
      if ((file?.type.startsWith('image/'))||(file?.type.startsWith('video/'))) {
        e.preventDefault();
        this.handleUploadMedia(file);
      }
    });
  }

  handleUploadMedia(file: File){
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    this.quillService.handleUploadApi(file, this.draftId).subscribe({
      next: (url) => {
        const range = this.currentQuillInstance.getSelection(true);
        const index = range ? range.index : 0;
        
        if(isImage){
          this.currentQuillInstance.insertEmbed(index, 'image', `${environment.cloudFrontUrl}/${url}`);
          this.currentQuillInstance.setSelection(index + 1);
        }else if(isVideo) {
          // Chèn video vào vị trí con trỏ
          this.currentQuillInstance.insertEmbed(index, 'video', `${environment.cloudFrontUrl}/${url}`);
          this.currentQuillInstance.setSelection(index + 1);
        }
      }
    })
  }

  removeLinkFromContent(url: string){
    if( this.currentQuillInstance && url) {
      const content = this.currentQuillInstance.getText(); // lay toan bo chu thuan
      const index = content.indexOf(url); // tim vi tri cua url
      if (index !== -1){
        this.currentQuillInstance.deleteText(index, url.length);
      }
    }
  }

  ngOnDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

}
