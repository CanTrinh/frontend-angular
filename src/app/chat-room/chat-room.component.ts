import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketService } from '../core/services/socket.service';
import { debounceTime, distinctUntilChanged, filter, Subject, Subscription, switchMap } from 'rxjs';
import { VideoService } from './video.service';
import { UserService } from '../user/user.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GroupCreationComponent } from './group-creation/group-creation.component';
import { UserSearchComponent } from '../user/user-search/user-search.component';
import { environment } from 'src/environments/environment.prod';
import { AvatarComponent } from "../shared/components/avatar/avatar.component";
import { UserStatusPipe } from '../pipes/user-status.pipe';
import { LoginService } from '../features/auth/login/login.service';
import { AudioService } from './audio.service';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GroupCreationComponent, UserSearchComponent, AvatarComponent, UserStatusPipe],
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit, OnDestroy{

  

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  
  searchForm!: FormGroup;
  user: any;

  public apiCloudFront = `${environment.cloudFrontUrl}/`;
  
  rooms: any[] = [];
  participantIds: any[] = [];
  activeRoom: any = null; // Lấy từ route hoặc danh sách phòng
  messages: any[] = [];

  duration: number;
  
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
    private audioService: AudioService,
    private userService: UserService,
    private fb: FormBuilder,
    private loginService: LoginService
  ) {
     this.loginService.user$.subscribe(u => {
      // 1. Cập nhật user mới nhất (bao gồm cả profilePic mới)
      this.user = u; 
    });
  }

  ngOnInit() {
    this.searchForm = this.fb.group({
            search: ['', [Validators.required, Validators.maxLength(100)]],
    });

        // 2. Lắng nghe thay đổi của ô input: Nếu xóa hết chữ thì tự động load lại tất cả
    this.searchForm.get('search')?.valueChanges.subscribe(value => {
      if (!value || value.trim() === '') {
        this.searchUsers = [];
        this.showSearchResults = false; 
      }
    });


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

    // 2. Lắng nghe người nhận từ chối hoặc chấp nhận đóng giao diện gọi
    this.subs.add(
      this.socketService.callResponse$.subscribe(data => {
       if(data.status === 'REJECTED'){
        this.duration= data.duration;
        this.videoService.leaveCall();
        this.isCalling = false;
       }else if(data.status === 'ACCEPTED') {
        this.isCalling = true;
       }    
      })
    );

    // 2. Lắng nghe có tín hiệu kết thúc đóng giao diện gọi
    this.subs.add(
      this.socketService.callEnded$.subscribe(data => {
        this.duration = data.duration;
        this.videoService.leaveCall();
        this.isCalling = false;
        
      })
    );

    this.loadRooms();

    /*
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
    */
  
  }

  // Hàm gọi khi người dùng gõ phím
  onSearchUser() {
    //const term = (event.target as HTMLInputElement).value;
    // Lấy chuỗi từ ô input
    const term = this.searchForm.get('search')?.value || '';
    if (term){
      this.isLoading = true;
      this.showSearchResults = true;
    }
    this.userService.searchUsers(term).subscribe({
      next: (results) => {
        this.searchUsers = results;
        this.isLoading = false;
      },
      error: () => {this.isLoading = false; this.showSearchResults = false;}
    });

    /*if (!term) {
      this.searchUsers = [];
      this.showSearchResults = false;
      return;
    }
    this.showSearchResults = true;
    this.searchSubject.next(term);
    
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(400),           // Đợi 400ms sau khi ngừng gõ mới phát tín hiệu
      distinctUntilChanged(),      // Chỉ tìm nếu từ khóa khác với lần tìm trước đó
      filter((term) => term.trim().length >= 2), // Chỉ tìm khi có từ 2 ký tự trở lên
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
    */
  
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
    this.participantIds = room.participants.map(r => r.user.id);

    // Join room qua socket
    this.socketService.joinRoom(room.id);
  
    this.userService.getMessages(room.id).subscribe((msgs:any) => {
      this.socketService.setInitialMessages(room.id, msgs);
      this.scrollToBottom();
    });

  }

  // Gửi tin nhắn
  sendMessage(text: string) {
    if (!text.trim()) return;
    this.socketService.sendMessage(this.activeRoom?.id, text, 'Tên_Của_Tôi');
  }

  // Thực hiện cuộc gọi (Bên gọi)
  async startCall(callType:'VOICE'|'VIDEO') {
    const channelName = `call_${Date.now()}`; // Tạo channel ngẫu nhiên
    //const targetUserId = 'id-nguoi-nhan'; // Lấy từ danh sách đang chat
 
    
    const res: any = await this.socketService.makeCall(this.activeRoom.id,this.participantIds,this.user.name, channelName, callType);
    
    if (res.status === 'calling') {
      this.isCalling = true;
      // Dùng Token trả về từ NestJS để join Agora
      await this.videoService.joinCall(this.activeRoom.id,res.appId, channelName, res.agoraToken, res.callerId , callType);
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

    const res: any = await this.socketService.acceptedCall(data.roomId,data.channelName);
    
    if (res.status === 'SUCCESS') {
      this.isCalling = true;
      // Dùng Token trả về từ NestJS để join Agora
      await this.videoService.joinCall(data.roomId,res.appId, data.channelName, res.agoraToken, res.receiverId , data.callType);
    } else {
      alert('đã có lỗi xảy ra khi join agora channel');
    }
  }

  async rejectCall() {
    const data = this.incomingCallData;
    this.incomingCallData = null;
    this.isCalling = false;
    this.stopRingtone();
    this.videoService.leaveCall();
    await this.socketService.rejectCall(data.roomId,data.fromUserId,data.callType )
  }

  async endedCall() {
    this.isCalling = false;
    this.videoService.leaveCall();
    console.log(this.incomingCallData);
    if(!this.incomingCallData){
      await this.socketService.endedCall(this.activeRoom.id,  this.user.sub );
    } else if(this.incomingCallData) {
      await this.socketService.endedCall(this.incomingCallData.roomId,  this.incomingCallData.fromUserId );
    }

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
  playRingtone() { 
    this.audioService.playRingtone();
  }
  stopRingtone() { 
    this.audioService.stopRingtone();
   }
}
