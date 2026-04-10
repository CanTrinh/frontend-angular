import { Component, Input, OnInit } from '@angular/core'; 
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommentService } from './comment.service';
import { CommonModule } from '@angular/common';
import { LoginService } from '../features/auth/login/login.service';
import { environment } from 'src/environments/environment.prod';


@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {
  @Input() postId!: string; // pass postId from parent component 
  commentForm: FormGroup; 
  comments: any[] = [];
  userUrl = `${environment.cloudFrontUrl}/`;
  isLogged: boolean= false;
  constructor(private fb: FormBuilder, 
    private commentService: CommentService,
    private loginService: LoginService) { 
      this.commentForm = this.fb.group({ content: ['', Validators.required] }
      ); 

      this.isLogged = this.loginService.isLoggedIn();
    } 
    ngOnInit() { 
  
      this.loadComments(); 
    } 
    
    loadComments() { 
      this.commentService.getComments(this.postId).subscribe({ 
        next: (res) => {
        

        this.comments = res; 

          
        },
        error: (err) => {
          console.error('Error load comments:', err);
        }

      }); 
    }

    submitComment() { 
      if (this.commentForm.valid) { 
        this.commentService.createComment(this.postId, this.commentForm.value) 
        .subscribe(newComment => { 
          console.log(newComment);
          this.comments.push(newComment); // update list instantly 
          this.commentForm.reset(); 
        });
      } 
    }

}
