import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor,AsyncPipe  } from '@angular/common';
import { xeYa } from '../yamaha';
import { Observable, switchMap } from 'rxjs';
import { YamahaService } from '../yamaha.service';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { YamahaDetailComponent } from '../yamaha-detail/yamaha-detail.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-yamaha-list',
  standalone: true,
  imports: [CommonModule,FormsModule, NgFor, RouterLink, RouterOutlet, AsyncPipe, YamahaDetailComponent],
  templateUrl: './yamaha-list.component.html',
  styleUrls: ['./yamaha-list.component.css']
})
export class YamahaListComponent implements OnInit{
  xeyas$?: Observable<xeYa[]>;
  selectedId = 0;

  constructor(
    private service: YamahaService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.xeyas$ = this.route.firstChild?.paramMap.pipe(
      switchMap(params => {
        this.selectedId = parseInt(params.get('id')!, 10);
        return this.service.getXeYas();
      })
    );
  }
}
