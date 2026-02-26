import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, switchMap } from 'rxjs';
import { xe } from '../honda';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { HondaService } from '../honda.service';

@Component({
  selector: 'app-honda-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './honda-detail.component.html',
  styleUrls: ['./honda-detail.component.css']
})
export class HondaDetailComponent implements OnInit {
  xe$!: Observable<xe>;

  @Input() xe: xe | undefined;

  constructor( private route: ActivatedRoute,
               private router: Router,
               public service: HondaService) {}
  
  // toán tử switchMap cho phép việc xử lý các tham số tuyến đường đã quan sát đc
  ngOnInit() {
    // this.xe$ = this.route.paramMap.pipe( // một quan sát chứa 1 map của các tham số bắt buộc và tùy chọn dc truyền cho pipe
    //   switchMap((params: ParamMap) =>  // interface ParamMap: một map cung cấp khả năng truy cập vào tham số bắt buộc và tham số tùy chọn của tuyến cụ thể khi bản đồ định tuyến có sự thay đổi
    //     this.service.getXe(params.get('id')!))// params.get('id') cho phép ta lấy đc tham số id từ tuyến đã quan sát đc
    // );

    // snapshot cung cấp giá trị ban đầu của map tham số tuyến đường
    // chúng ta có thể truy cập trực tiếp vào các tham số đó mà không cần phải subsciber hoặc thêm thao tác quan sát observable
    // khi biết chắc chắn rằng thành phần honda-detail này không đc tái sử dụng lại nên ta dùng snapshot thay vì cách trên
    const id = this.route.snapshot.paramMap.get('id')!; 
    
    this.xe$ = this.service.getXe(id);
  }


  // điều hướng trở lại listxe từ detail và truyền vào các tham số tùy chọn
  // truyền lại tham số id như tùy chọn để ta biết detail nào vừa đc chọn, tham số foo là tham số bổ sung cho vui ko có ý nghĩa.
  // các tham số tùy chọn này sẽ đc phân tách bằng dấu ; trên thanh bar ví dụ .../honda;id=15;foo=foo
  // nếu phân tách là dấu ? và dấu & thì là các tham số truy vấn chuỗi.
  gotoListXe(xe: xe) {
    const xeId = xe ? xe.id : null;
    // Pass along the hero id if available
    // so that the HeroList component can select that hero.
    // Include a junk 'foo' property for fun.
    this.router.navigate(['/honda', {id: xeId, foo: 'foo'}]);
  }

}
