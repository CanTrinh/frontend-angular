import { Component, OnInit } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { PostService } from 'src/app/post/post.service';
import { ActivatedRoute } from '@angular/router';
import { SanitizeUrlService } from 'src/app/sanitize-url.service';
import { CommentsComponent } from 'src/app/comments/comments.component';
import { SafeResourceUrl } from '@angular/platform-browser';



@Component({
  selector: 'app-home-detail',
  standalone: true,
  imports: [CommonModule, CommentsComponent],
  templateUrl: './home-detail.component.html',
  styleUrls: ['./home-detail.component.css']
})
export class HomeDetailComponent implements OnInit {

  /*post: any;

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
  }*/

  post: any;
  safeYoutubeUrl: SafeResourceUrl | null = null;
  isShorts = false;
  // post-detail.component.ts
cloudFrontUrl = '"https://cdn.ctlife.xyz"'; // Lấy từ biến môi trường hoặc config


  constructor(
    private postService: PostService,
    private sanitizeService: SanitizeUrlService, // Inject service của bạn
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.postService.getPost(id).subscribe(data => {
        this.post = data;
        
        // 📺 Nếu là YouTube, xử lý link để nhúng
        if (this.post.type === 'YOUTUBE' && this.post.mediaUrl) {
           // 1. Kiểm tra xem có phải link Shorts không
          this.isShorts = this.post.mediaUrl.includes('/shorts/');
          // 2. Trích xuất ID và sanitize như cũ
          const videoId = this.extractYouTubeId(this.post.mediaUrl);
           if (videoId) {
          // Nhúng vào Iframe chuẩn (YouTube tự động nhận diện nếu là Shorts)
          this.safeYoutubeUrl = this.sanitizeService.sanitizeResourceUrl(
            `https://www.youtube.com/embed/${videoId}`
          );
        }
        }
      });
    }
  }

    // Hàm hỗ trợ chuyển link thường sang link embed
  private convertToEmbedUrl(url: string): string {
    const id = url.split('v=')[1] || url.split('/').pop();
    return `https://www.youtube.com{id}`;
  }

  private extractYouTubeId(url: string): string {
      // Regex này bắt được cả: watch?v=ID, youtu.be/ID, và shorts/ID
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?v=)|(shorts\/))([^#\&\?]{11}).*/;
      const match = url.match(regExp);
      
      // ID YouTube luôn có độ dài 11 ký tự
      return (match && match[8].length === 11) ? match[8] : '';
  }

}




