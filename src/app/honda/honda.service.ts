import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { xe } from './honda';
import { loaixe } from './mock-honda';
import { MessageService } from '../message.service';

@Injectable({
  providedIn: 'root',
})
export class HondaService {

  constructor(private messageService: MessageService) { }

  // phương thức getHeroes() này phục vụ việc lấy một mảng với các phần tử bên trong là một đối tượng

  getListXe(): Observable<xe[]> {
    const listXe = of(loaixe);// hằng số listXe sẽ dạng của hằng số of(loaixe): [{},{}]
    this.messageService.add('HondaService: fetched cac loai xe'); // trả về ['HondaService: fetched cac loai xe'];
    return listXe; // tra về: [{},{}]
  }

  // phương thức getXe để lấy đc xe thông qua tham số id
  getXe(id: number | string) {
    return this.getListXe().pipe(
      // (+) before `id` turns the string into a number
      map((listxe: xe[]) => listxe.find(xe => xe.id === +id)!)
    );
  }
}
