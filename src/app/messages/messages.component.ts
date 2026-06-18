import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from '../message.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent {
  constructor(public messageService: MessageService) {}

  // Nhận dữ liệu từ ChatRoom truyền xuống
  @Input() message!: any;
  @Input() currentUserId!: string;

  // Bắn sự kiện ngược lên ChatRoom khi người dùng tương tác
  @Output() onCallback = new EventEmitter<'VOICE' | 'VIDEO'>();
  @Output() onPreviewImage = new EventEmitter<string>();
  @Output() onDownloadFile = new EventEmitter<string>();

  // 1. Giải mã JSON cuộc gọi
  getCallDetails(content: string) {
    try {
      const data = JSON.parse(content);
      if (data && data.isCallLog) return data;
      return null;
    } catch (e) {
      return null;
    }
  }

  // 2. Định dạng thời gian cuộc gọi
  formatDuration(seconds: number): string {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // 3. Lấy icon cho file tài liệu dựa trên URL
  getFileIcon(url: string): string {
    const fileName = url.substring(url.lastIndexOf('/') + 1);
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'fa-file-pdf text-danger';
      case 'doc': case 'docx': return 'fa-file-word text-primary';
      case 'xls': case 'xlsx': return 'fa-file-excel text-success';
      case 'ppt': case 'pptx': return 'fa-file-powerpoint text-warning';
      default: return 'fa-file-alt';
    }
  }

  // 4. Lấy tên file rút gọn để hiển thị
  getFileName(url: string): string {
    return decodeURIComponent(url.substring(url.lastIndexOf('/') + 1));
  }

}
