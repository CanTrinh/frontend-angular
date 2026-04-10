import { Component, inject, Input, OnInit } from '@angular/core';
import { PostService } from '../post/post.service';
import { CdkDrag} from '@angular/cdk/drag-drop'
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HomeService } from './home.service';
import { DatePipe, NgFor, NgIf, NgForOf,SlicePipe } from '@angular/common';
import { PostComponent } from '../post/post.component';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

// category.dto.ts
export interface CategoryDto {
  id: number;
  type: string;
}


@Component({
  selector: 'app-home',
  standalone:true,
  imports: [ReactiveFormsModule, NgFor,NgIf, RouterLink, RouterLinkActive, DatePipe,SlicePipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  searchForm!: FormGroup;

  posts: any[] = [];
  //loading = false;
  //mistake = false;
  errorMessage: string = '';
  
  private router = inject(Router);

  constructor(private postService: PostService,
              private fb: FormBuilder, 
  ) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
        search: ['', [Validators.required, Validators.maxLength(100)]],
    });
    this.loadPosts();

    // 2. Lắng nghe thay đổi của ô input: Nếu xóa hết chữ thì tự động load lại tất cả
    this.searchForm.get('search')?.valueChanges.subscribe(value => {
      if (!value || value.trim() === '') {
        this.errorMessage = '';
        this.loadPosts(); // Load lại toàn bộ
      }
    });
  }

  loadPosts(): void {
   // this.loading = true;
  
  // Lấy chuỗi từ ô input
  const keyword = this.searchForm.get('search')?.value || '';

  this.postService.getPosts(keyword).subscribe({
    next: (data) => {
      this.posts = data;
      
      // Xử lý thông báo nếu tìm mà không thấy
      if (keyword && data.length === 0) {
        this.errorMessage = `Không tìm thấy kết quả cho "${keyword}"`;
      } else {
        this.errorMessage = '';
      }
    },
    error: (err) => {
      this.errorMessage = 'Lỗi kết nối máy chủ';
    }
  });
}

  

  viewDetail(id: string) {
    this.router.navigate(['/posts', id]);
  }
}


