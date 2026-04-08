import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment.prod';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reactions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reactions.component.html',
  styleUrls: ['./reactions.component.css']
})
export class ReactionsComponent {
  @Input() targetId: string;
  @Input() isPost: boolean;
  @Input() currentUserReaction: any; // Nhận từ bài Post trả về

  private http = inject(HttpClient);
  
  reactionIcons = [
    { type: 'LIKE', label: 'Thích', url: `${environment.cloudFrontUrl}/static/images/reactions/like_v1.svg` },
    { type: 'LOVE', label: 'Yêu', url: `${environment.cloudFrontUrl}/static/images/reactions/love_v1.svg` },
    { type: 'HAHA', label: 'Haha', url: `${environment.cloudFrontUrl}/static/images/reactions/haha_v1.svg` },
    { type: 'WOW', label: 'Wow', url: `${environment.cloudFrontUrl}/static/images/reactions/wow_v1.svg` },
    { type: 'SAD', label: 'Buồn', url: `${environment.cloudFrontUrl}/static/images/reactions/sad_v1.svg` },
    { type: 'ANGRY', label: 'Tức', url: `${environment.cloudFrontUrl}/static/images/reactions/angry_v1.svg` },
  
    ];

  onSelect(type: string) {
    // Gọi API NestJS (toggleReaction) tại đây
    const payload = {
      targetId: this.targetId,
      isPost: this.isPost,
      type: type
    };
    console.log(`User clicked ${type} for ${this.targetId}`);

    return this.http.post(`${environment.apiUrl}/posts/reactions`, payload);

   
  }
}
