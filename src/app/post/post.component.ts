import { Component, Input } from '@angular/core';
//import { CdkDrag} from '@angular/cdk/drag-drop'
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PostService } from './post.service';
import { DatePipe, NgFor, NgIf, NgForOf, } from '@angular/common';
import { Router } from '@angular/router';




@Component({
  selector: 'app-post',
  standalone:true,
  imports: [ReactiveFormsModule, DatePipe, NgIf, NgFor, ],
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent {

  postForm!: FormGroup;

  constructor(private fb: FormBuilder, 
    private postService: PostService,
    private router: Router) {}

  ngOnInit(): void {
    // Initialize Reactive Form
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      content: ['', [Validators.required, Validators.maxLength(500)]],
      mediaUrl: ['']
    });
  }

  // Submit handler
  onSubmit(): void {
    if (this.postForm.valid) {
      this.postService.createPost(this.postForm.value).subscribe({
        next: (res) => {
          console.log('Post created successfully:', res);
          this.postForm.reset(); // clear form after success
          this.router.navigate(['/posts', res.id]);
        },
        error: (err) => {
          console.error('Error creating post:', err);
        }
      });
    }
  }


  @Input() post: any; // post object passed from parent (feed component)
  showComments = false;

  // Toggle comments visibility
  toggleComments(postId: number): void {
    this.showComments = !this.showComments;
    if (this.showComments && !this.post.comments) {
      this.postService.getComments(postId).subscribe({
        next: (comments) => (this.post.comments = comments),
        error: (err) => console.error('Error loading comments:', err)
      });
    }
  }

  // Like post
  likePost(postId: number): void {
    this.postService.likePost(postId).subscribe({
      next: (updatedPost) => (this.post.likes = updatedPost.likes),
      error: (err) => console.error('Error liking post:', err)
    });
  }

  // Edit post (could open a modal or navigate)
  editPost(postId: number): void {
    console.log('Edit post:', postId);
    // implement navigation or modal here
  }

  // Delete post
  deletePost(postId: number): void {
    this.postService.deletePost(postId).subscribe({
      next: () => console.log('Post deleted'),
      error: (err) => console.error('Error deleting post:', err)
    });
  }

  // Permissions (example logic)
  canEdit(post: any): boolean {
    return post.user.id === this.postService.currentUserId;
  }

  canDelete(post: any): boolean {
    return post.user.id === this.postService.currentUserId || this.postService.isAdmin();
  }




  

}
