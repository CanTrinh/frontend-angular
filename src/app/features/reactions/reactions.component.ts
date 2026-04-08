import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { LoginService } from '../auth/login/login.service';
import { REACTION_LIST } from '../../shared/constants/reaction.constant';

@Component({
  selector: 'app-reactions',
  standalone: true,
  imports: [CommonModule,],
  templateUrl: './reactions.component.html',
  styleUrls: ['./reactions.component.css']
})
export class ReactionsComponent {
  @Input() targetId: string;
  @Input() isPost: boolean;
  @Input() currentUserReaction: any; // Nhận từ bài Post trả về
  readonly reactionIcons= REACTION_LIST;


  private http = inject(HttpClient);
  constructor(private loginService: LoginService){}
  isLogin:boolean = this.loginService.isLoggedIn();

  @Output() reactionChanged = new EventEmitter<string>();

  

  onSelect(type: string) {
    // Bắn sự kiện ra ngoài để UI thay đổi ngay lập tức
    this.reactionChanged.emit(type);
    // Gọi API NestJS (toggleReaction) tại đây
    const payload = {
      targetId: this.targetId,
      isPost: this.isPost,
      type: type
    };
    console.log(`User clicked ${type} for ${this.targetId}`);

    return this.http.post(`${environment.apiUrl}/posts/reactions`, payload).subscribe(reaction =>{
      console.log(`ban da tha reaction thanh cong: ${reaction}`)

    });

   
  }
}
