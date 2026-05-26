import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketService } from '../core/services/socket.service';
import { debounceTime, distinctUntilChanged, filter, Subject, Subscription, switchMap } from 'rxjs';
import { VideoService } from './video.service';
import { UserService } from '../user/user.service';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit, OnDestroy{

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  
  rooms: any[] = [];
  activeRoom: any = null; // Lấy từ route hoặc danh sách phòng
  messages: any[] = [];
  
  isCalling = false;
  incomingCallData: any = null;
  private subs = new Subscription();

  // Lưu danh sách ID đã bấm gửi để thay đổi trạng thái UI
  pendingRequestIds: Set<string> = new Set();

  // Luồng dữ liệu tìm kiếm
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  searchUsers: any[] = [];
  showSearchResults = false;
  isLoading = false;

  constructor(
    public socketService: SocketService,
    public videoService: VideoService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.socketService.connect();
    this.socketService.setupChatListeners();

    // 1. Lắng nghe tin nhắn từ BehaviorSubject của Service
    this.subs.add(
      this.socketService.currentRoomMessages$.subscribe(msgs => {
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

    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(400),           // Đợi 400ms sau khi ngừng gõ mới phát tín hiệu
      distinctUntilChanged(),      // Chỉ tìm nếu từ khóa khác với lần tìm trước đó
      filter(term => term.trim().length >= 2), // Chỉ tìm khi có từ 2 ký tự trở lên
      switchMap(term => {          // Hủy bỏ request cũ nếu có request mới chen vào
        this.isLoading = true;
        return this.userService.searchUsers(term);
      })
    ).subscribe({
      next: (results) => {
        this.searchUsers = results;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  
  }

  // Hàm gọi khi người dùng gõ phím
  onSearchUser(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    if (!term) {
      this.searchUsers = [];
      this.showSearchResults = false;
      return;
    }
    this.showSearchResults = true;
    this.searchSubject.next(term);
  }

  sendFriendRequest(friendId: string) {
    // Tránh gửi trùng khi đang xử lý
    if (this.pendingRequestIds.has(friendId)) return;

    this.pendingRequestIds.add(friendId);

    this.userService.addFriend(friendId).subscribe({
      next: (res) => {
        // Thông báo thành công (có thể dùng Toast)
        console.log('Đã gửi lời mời!');
      },
      error: (err) => {
        this.pendingRequestIds.delete(friendId); // Nếu lỗi thì cho phép bấm lại
        alert('Không thể gửi lời mời: ' + err.error.message);
      }
    });
  }

  // --- HỆ THỐNG CHAT ---
  createGroup(selectedUserIds: string[], groupName: string) {
    const payload = {
      userIds: selectedUserIds, // Danh sách ID thành viên [A, B, C...]
      name: groupName,
      isGroup: true
    };

    this.userService.createRoom(payload).subscribe((newRoom:any) => {
      this.rooms = [newRoom, ...this.rooms];
      this.selectRoom(newRoom);
      // Bắn socket mời tất cả thành viên vào Room này
      //this.socketService.createRoomchat(newRoom.id, selectedUserIds);
    });
  }

  loadRooms() {
   
    this.userService.getUserRooms().subscribe((rooms:any) => {
      this.rooms = rooms;
      const roomIds = rooms.map(r => r.id);
      
      // Gửi sự kiện join cho tất cả các phòng đã có
      roomIds.forEach((roomId:string)=>{
        this.socketService.joinRoom(roomId);
      })
    });

  }

  selectRoom(room: any) {
    this.activeRoom = room;
    this.userService.getMessages(room.id).subscribe((msgs:any) => {
      this.socketService.setInitialMessages(room.id, msgs);
      this.scrollToBottom();
    });
    // Join room qua socket
    this.socketService.joinRoom(room.id);
  }

  // Gửi tin nhắn
  sendMessage(text: string) {
    if (!text.trim()) return;
    this.socketService.sendMessage(this.activeRoom?.id, text, 'Tên_Của_Tôi');
  }

  // Thực hiện cuộc gọi (Bên gọi)
  async startCall(callType: string) {
    const channelName = `call_${Date.now()}`; // Tạo channel ngẫu nhiên
    const targetUserId = 'id-nguoi-nhan'; // Lấy từ danh sách đang chat

    const res: any = await this.socketService.makeCall(targetUserId, 'Tên_Của_Tôi', channelName);
    
    if (res.status === 'calling') {
      this.isCalling = true;
      // Dùng Token trả về từ NestJS để join Agora
      await this.videoService.joinCall(res.appId, channelName, res.agoraToken, 'My_UUID', 'VOICE');
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
    await this.videoService.joinCall('YOUR_AGORA_APP_ID', data.channelName, data.agoraToken, 'My_UUID','VOICE');
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
    this.videoService.leaveCall();
    this.searchSubscription?.unsubscribe(); // Hủy để tránh memory leak
  }

  // Mock-up nhạc chuông
  playRingtone() { /* logic phát file audio */ }
  stopRingtone() { /* logic dừng file audio */ }
}
