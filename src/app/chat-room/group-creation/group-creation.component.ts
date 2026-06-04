import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SocketService } from '../../core/services/socket.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../user/user.service';
import { FriendInforDto } from 'src/app/shared/types/friendInfor.interface';
import { AvatarComponent } from 'src/app/shared/components/avatar/avatar.component';
import { UserStatusPipe } from 'src/app/pipes/user-status.pipe';

@Component({
  selector: 'app-group-creation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AvatarComponent,UserStatusPipe],
  templateUrl: './group-creation.component.html',
  styleUrls: ['./group-creation.component.css']
})
export class GroupCreationComponent implements OnInit {
  groupForm!: FormGroup;
  friendsList: FriendInforDto[] = []; // Danh sách bạn bè load từ API

  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private socketService = inject(SocketService);
  private userService = inject(UserService);
  ngOnInit() {
    this.initForm();
    this.loadFriends();
  }

  private initForm() {
    this.groupForm = this.fb.group({
      roomName: ['', [Validators.required, Validators.minLength(3)]],
      userIdsArray: this.fb.array([]) // Lưu trữ danh sách các ID được chọn
    });
  }

  get userIdsArray(): FormArray {
    return this.groupForm.get('userIdsArray') as FormArray;
  }

  /** Tải danh sách những người đã kết bạn (status = ACCEPTED) */
  loadFriends() {
    this.userService.getFriends().subscribe({
      next: (res:any) => this.friendsList = res,
      error: (err) => console.error('Không thể tải danh sách bạn bè', err)
    });
  }

  /** Xử lý khi click tick/untick checkbox */
  onCheckboxChange(event: any, userId: string) {
    if (event.target.checked) {
      // Nếu chọn: Thêm ID vào FormArray
      this.userIdsArray.push(this.fb.control(userId));
    } else {
      // Nếu bỏ chọn: Tìm vị trí và xóa khỏi FormArray
      const index = this.userIdsArray.controls.findIndex(x => x.value === userId);
      if (index !== -1) {
        this.userIdsArray.removeAt(index);
      }
    }
  }

  /** Kiểm tra trạng thái đã check hay chưa phục vụ giao diện render */
  isFriendSelected(userId: string): boolean {
    return this.userIdsArray.value.includes(userId);
  }

  /** Trích xuất mảng string các UserID thuần túy */
  getSelectedUserIds(): string[] {
    return this.userIdsArray.value;
  }

  onSubmit() {
    if (this.groupForm.invalid) return;

    const roomName = this.groupForm.value.roomName;
    const selectedUserIds = this.getSelectedUserIds();

    const payload = {
      userIds: selectedUserIds, // Danh sách ID thành viên [A, B, C...]
      name: roomName,
      isGroup: true
    };

    // Gọi hàm tạo phòng chat nhóm từ SocketService
    // Tham số: Mảng ID thành viên, isGroup = true, Tên phòng nhóm
    this.userService.createRoom(payload);

    // Reset lại form sau khi gửi yêu cầu thành công
    this.groupForm.reset();
    this.userIdsArray.clear();
  }
}

