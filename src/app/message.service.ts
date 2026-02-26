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
  }

  clear() {
    this.messages = [];
  }
}