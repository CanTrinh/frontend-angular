import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketService } from '../core/services/socket.service';
import { Subscription } from 'rxjs';
import { VideoService } from './video.service';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit, OnDestroy{

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  
  activeRoomId = 'room-uuid-tu-db'; // Lấy từ route hoặc danh sách phòng
  messages: any[] = [];
  isCalling = false;
  incomingCallData: any = null;
  private subs = new Subscription();

  constructor(
    public socketService: SocketService,
    public videoService: VideoService
  ) {}

  ngOnInit() {
    this.socketService.connect();
    this.socketService.setupChatListeners();

    // 1. Lắng nghe tin nhắn từ BehaviorSubject của Service
    this.subs.add(
      this.socketService.messages$.subscribe(msgs => {
        this.messages = msgs;
        this.scrollToBottom();
      })
    );

    // 2. Lắng nghe cuộc gọi đến (Hiện Popup)
    this.subs.add(
      this.socketService.incomingCall$.subscribe(data => {
        this.incomingCallData = data;
        this.playRingtone(); // Hàm phát nhạc chuông
      })
    );
  }

  // Gửi tin nhắn
  send(text: string) {
    if (!text.trim()) return;
    this.socketService.sendMessage(this.activeRoomId, text, 'Tên_Của_Tôi');
  }

  // Thực hiện cuộc gọi (Bên gọi)
  async startCall() {
    const channelName = `call_${Date.now()}`; // Tạo channel ngẫu nhiên
    const targetUserId = 'id-nguoi-nhan'; // Lấy từ danh sách đang chat

    const res: any = await this.socketService.makeCall(targetUserId, 'Tên_Của_Tôi', channelName);
    
    if (res.status === 'calling') {
      this.isCalling = true;
      // Dùng Token trả về từ NestJS để join Agora
      await this.videoService.joinChannel(res.appId, channelName, res.agoraToken, 'My_UUID');
    } else {
      alert('Người dùng hiện không online!');
    }
  }

  // Chấp nhận cuộc gọi (Bên nhận)
  async acceptCall() {
    const data = this.incomingCallData;
    this.isCalling = true;
    this.incomingCallData = null;
    this.stopRingtone();

    // Lấy appId từ đâu? Bạn có thể gửi kèm appId trong socket 'incomingCall' từ NestJS
    await this.videoService.joinChannel('YOUR_AGORA_APP_ID', data.channelName, data.agoraToken, 'My_UUID');
  }

  rejectCall() {
    this.incomingCallData = null;
    this.stopRingtone();
    // Gửi sự kiện respondCall nếu cần (như trong service bạn đã có)
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    }, 100);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.videoService.leave();
  }

  // Mock-up nhạc chuông
  playRingtone() { /* logic phát file audio */ }
  stopRingtone() { /* logic dừng file audio */ }
}
