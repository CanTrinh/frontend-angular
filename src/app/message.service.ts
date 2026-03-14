import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
// lớp MesageService là một lớp phục vụ việc thêm một chuỗi vào một mảng có các phẩn tử kiểu chuỗi ['', '']
// và xóa dữ liệu trong mảng bằng cách cho mảng về rỗng
export class MessageService {

  messages: string[] = [];

  add(message: string) {
    this.messages.push(message);// ['message.value', '']
    setTimeout(() => {
      this.removeFirst();
    }, 5000);
  }

   // Xóa tin nhắn cũ nhất (phần tử đầu tiên)
  removeFirst() {
    if (this.messages.length > 0) {
      this.messages.shift();
    }
  }

  clear() {
    this.messages = [];
  }
}