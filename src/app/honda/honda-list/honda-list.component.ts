import { Component, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule, NgFor } from '@angular/common';
import { Observable, switchMap } from 'rxjs';
import { xe } from '../honda';
import { HondaService } from '../honda.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-honda-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgFor, AsyncPipe],
  templateUrl: './honda-list.component.html',
  styleUrls: ['./honda-list.component.css']
})
export class HondaListComponent implements OnInit {
  listxe$?: Observable<xe[]>; // gan thuoc tinh listxe$ co type mang voi cau truc nhu quan sat dc cuar interface xe[]
  selectedId = 0;

  constructor(
    private service: HondaService,
    private route: ActivatedRoute // cho phep truy cap vao du lieu tuyen khi tuyen do da activated
  ) {}

  ngOnInit() {
    this.listxe$ = this.route.paramMap.pipe(
      switchMap(params => {
        this.selectedId = parseInt(params.get('id')!, 10);
        return this.service.getListXe();
      })
    );
  }
}

