import { Component, inject, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SocketService } from 'src/app/core/services/socket.service';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { UserSearchService } from './user-search.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../user.service';
import { AvatarComponent } from 'src/app/shared/components/avatar/avatar.component';
import { UserStatusPipe } from 'src/app/pipes/user-status.pipe';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-user-search',
  standalone: true,
  imports: [CommonModule, FormsModule,ReactiveFormsModule, AvatarComponent, UserStatusPipe],
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.css']
})
export class UserSearchComponent {
    
    searchForm!: FormGroup;
    
    rooms: any[] = [];
    activeRoom: any = null; // Lấy từ route hoặc danh sách phòng
    messages: any[] = [];

   
    
    isCalling = false;
    incomingCallData: any = null;
    private subs = new Subscription();

  
    // Lưu danh sách ID đã bấm gửi để thay đổi trạng thái UI
    pendingRequestIds: Set<string> = new Set();
  
  
    searchUsers: any[] = [];
    showSearchResults = false;
    isLoading = false;

    iscreate= false;
  
    constructor(
      public socketService: SocketService,
      private userService: UserService,
      private fb: FormBuilder
    ) {}
  
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
      //this.socketService.setupSocketListeners();
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

  openDirectChat(userId: string , name: string, avatar: string) {
    this.iscreate = true;
    // Khởi tạo phòng chat 1-1 (isGroup = false) thông qua REST API
    const payload = {
      name: name,  //name của room cũng là name của người nhận khi chat 1-1
      userIds: [userId], // Danh sách ID thành viên [A, B, C...]
      isGroup: false,
      avatar: avatar,
      type:"CHAT_1_1"
    };
    this.userService.createRoom(payload).subscribe();
    //this.searchQuery = '';
    //this.searchResults = [];
  }
  
  
 

  /*
  searchQuery = '';
  searchResults: any[] = [];
  
  private http = inject(HttpClient);
  private socketService = inject(SocketService);
  private searchSubject = new Subject<string>();
  private userService = inject(UserService);

  constructor() {
    // Sử dụng debounceTime để tránh spam gọi API liên tục khi user đang gõ phím
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(query => {
      this.executeSearch(query);
    });
  }

  onSearchChange() {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }
    this.searchSubject.next(this.searchQuery);
  }

  executeSearch(query: string) {
    this.userService.searchUsers(query).subscribe({
      next: (res) => this.searchResults = res,
      error: (err) => console.error('Lỗi tìm kiếm', err)
    });
  }*/

  /* Gửi kết bạn qua HTTP POST */
  /*addFriend(userId: string) {
    this.userService.addFriend(userId).subscribe({
      next: () => {
        // Cập nhật trạng thái local trên UI ngay lập tức
        const user = this.searchResults.find(u => u.id === userId);
        if (user) user.friendshipStatus = 'PENDING';
      },
      error: (err) => alert('Không thể gửi lời mời kết bạn')
    });
  }*/

  /** Click vào User để mở Chat 1-1 */
  /*openDirectChat(userId: string , name: string) {
    // Khởi tạo phòng chat 1-1 (isGroup = false) thông qua REST API
    const payload = {
      userIds: [userId], // Danh sách ID thành viên [A, B, C...]
      name: name,
      isGroup: false
    };
    this.userService.createRoom(payload);
    this.searchQuery = '';
    this.searchResults = [];
  }*/

}
