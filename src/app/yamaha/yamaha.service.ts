import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Injectable } from '@angular/core';
//import { MessageService } from '../message.service';
import { xeYa } from './yamaha';
import { XEYAS } from './mock-yamaha';

@Injectable({
  providedIn: 'root',
})
export class YamahaService {
  static nextXeYaId = 100;
  
  // tạo thuộc tính xeyas để đăng ký yêu cầu 1 giá trị khởi tạo và lắng nghe giá trị hiện tại bất kể khi nào nó đã đc đăng ký
  private xeyas$: BehaviorSubject<xeYa[]> = new BehaviorSubject<xeYa[]>(XEYAS);

  //constructor(private messageService: MessageService) { }
  
  //phương thức để lấy mảng xeyas$ từ viêc subcribe
  getXeYas() { return this.xeyas$; }

  // lấy từng phần tử trong mảng xeyas theo id truyền vào
  getXeYa(id: number | string) {
    return this.getXeYas().pipe(
      map(xeyas => xeyas.find(xeya => xeya.id === +id)!)
    );
  }

}