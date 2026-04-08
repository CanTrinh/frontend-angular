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

  posts: any[] = [];
  loading = false;
  private router = inject(Router);

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.postService.getPosts().subscribe({
      next: (data) => {
        this.posts = data;
        console.log(this.posts);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading posts:', err);
        this.loading = false;
      }
    });
  }

  viewDetail(id: string) {
    this.router.navigate(['/posts', id]);
  }
}


