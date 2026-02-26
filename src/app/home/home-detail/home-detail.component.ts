import { Component, OnInit } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { PostService } from 'src/app/post/post.service';
import { ActivatedRoute } from '@angular/router';
import { SanitizeUrlService } from 'src/app/sanitize-url.service';
import { CommentsComponent } from 'src/app/comments/comments.component';



@Component({
  selector: 'app-home-detail',
  standalone: true,
  imports: [CommonModule, CommentsComponent],
  templateUrl: './home-detail.component.html',
  styleUrls: ['./home-detail.component.css']
})
export class HomeDetailComponent implements OnInit {

  post: any;

  constructor(
    private postService: PostService,
    private sanitizeUrlService: SanitizeUrlService,
    private route: ActivatedRoute,
  ){}

  ngOnInit(): void {
    this.loadDetailPost();
  }

  loadDetailPost(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    this.postService.getPost(id).subscribe({
      next: (data) => {
        this.post = data;
      },
      error: (err) => {
        console.error('Error loading detailPost:', err);

      }
    });
  }

  isYoutube(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
  }

  isImage(url: string): boolean {
    return /\.(jpg|jpeg|png|gif)$/i.test(url);
  }

  extractImg(imgString: string): string{
    const getAfterImg = imgString.indexOf('img') + 4;
    return this.post.mediaUrl.slice(getAfterImg);
  }

  isPdf(url: string): boolean {
    return url.endsWith('.pdf');
  }

  isWord(url: string): boolean {
    return url.endsWith('.doc') || url.endsWith('.docx');
  }

  safeUrl( url: string) {
    return this.sanitizeUrlService.sanitizeUrl(url);
  }



}
