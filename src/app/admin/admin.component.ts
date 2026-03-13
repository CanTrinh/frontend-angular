import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit{
  private http = inject(HttpClient);
  users: any[] = [];
  roles = [
    { id: 1, name: 'ADMIN' },
    { id: 2, name: 'MOD' },
    { id: 3, name: 'USER' },
    { id: 4, name: 'GUEST' }
  ];

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.http.get<any[]>('/api/admin/users').subscribe(data => this.users = data);
  }

  // Hàm thay đổi Role khi Admin chọn từ Select Box
  onRoleChange(userId: number, newRoleId: number) {
    this.http.patch(`/api/admin/update-role/${userId}`, { roleId: newRoleId })
      .subscribe({
        next: () => alert('Cập nhật quyền thành công!'),
        error: (err) => alert('Lỗi: ' + err.error.message)
      });
  }
}
