import { Component, inject, Input, OnInit } from '@angular/core';
import { PostService } from '../post/post.service';
import { CdkDrag} from '@angular/cdk/drag-drop'
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HomeService } from './home.service';
import { DatePipe, NgFor, NgIf, NgForOf,SlicePipe } from '@angular/common';
import { PostComponent } from '../post/post.component';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AvatarComponent } from '../shared/components/avatar/avatar.component';
import { UserStatus } from '../shared/types/user-status.type';
import { SocketService } from '../core/services/socket.service';
import { Post } from '../shared/types/post.interface';

// category.dto.ts
export interface CategoryDto {
  id: number;
  type: string;
}


@Component({
  selector: 'app-home',
  standalone:true,
  imports: [ReactiveFormsModule, NgFor,NgIf, RouterLink, RouterLinkActive, DatePipe, AvatarComponent ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  searchForm!: FormGroup;
  

  posts: Post[] = [];
  
  //loading = false;
  //mistake = false;
  errorMessage: string = '';
  
  private router = inject(Router);

  constructor(private postService: PostService,
              private socketService: SocketService,
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

    // thuc hien subcribe bien userStatusMap$ ma da nhan du lieu tu gateway
    this.socketService.userStatusMap$.subscribe(statusMap => {
      this.posts.forEach(post => {
        // Ép kiểu (casting) để đảm bảo Typescript không báo lỗi
        const statusFromServer = statusMap.get(post.authorId) as UserStatus;
        post.authorStatus = statusFromServer || 'offline';
      });
    });


  }

  loadPosts(): void {
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


