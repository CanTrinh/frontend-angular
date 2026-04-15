import { Component, Input } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { SocketService } from 'src/app/core/services/socket.service';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [NgClass, NgIf],
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.css']
})
export class AvatarComponent {
  @Input() firstLetter: string;
  @Input() imageUrl: string;
  @Input() status: 'online' | 'offline' | 'warning' | 'danger' = 'offline';
  @Input() size: number = 32; // Cho phép tùy chỉnh kích thước linh hoạt



}
