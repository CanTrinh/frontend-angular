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
  loading = false;
  mistake = false;
  
  
  private router = inject(Router);

  constructor(private postService: PostService,
              private fb: FormBuilder, 
  ) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
        search: ['', [Validators.required, Validators.maxLength(100)]],
    });
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    if(this.searchForm.valid){
      const searchQuery: string = this.searchForm.get('search')?.value;
        this.postService.searchPosts(searchQuery).subscribe({
        next: (data) => {
          if(data=== null){
            this.mistake = true;
          }else{
          this.posts = data;
          console.log(this.posts);
          this.loading = false;
          }

        },
        error: (err) => {
          console.error('loi tim post:', err);
          this.loading = false;

        }
      });
    }else {
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
  }

  viewDetail(id: string) {
    this.router.navigate(['/posts', id]);
  }
}


