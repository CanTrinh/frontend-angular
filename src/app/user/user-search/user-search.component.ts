import { Component, inject, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SocketService } from 'src/app/core/services/socket.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { UserSearchService } from './user-search.service';
import { FormsModule } from '@angular/forms';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.css']
})
export class UserSearchComponent {
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
  }

  /** Gửi kết bạn qua HTTP POST */
  addFriend(userId: string) {
    this.userService.addFriend(userId).subscribe({
      next: () => {
        // Cập nhật trạng thái local trên UI ngay lập tức
        const user = this.searchResults.find(u => u.id === userId);
        if (user) user.friendshipStatus = 'PENDING';
      },
      error: (err) => alert('Không thể gửi lời mời kết bạn')
    });
  }

  /** Click vào User để mở Chat 1-1 */
  openDirectChat(userId: string , name: string) {
    // Khởi tạo phòng chat 1-1 (isGroup = false) thông qua REST API
    const payload = {
      userIds: [userId], // Danh sách ID thành viên [A, B, C...]
      name: name,
      isGroup: false
    };
    this.userService.createRoom(payload);
    this.searchQuery = '';
    this.searchResults = [];
  }
}
