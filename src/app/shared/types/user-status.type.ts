export type UserStatus = 'online' | 'offline' | 'warning' | 'danger';

// Bạn cũng có thể định nghĩa Interface cho User kèm status tại đây
export interface UserWithStatus {
  id: string;
  profilePic: string;
  status?: UserStatus;
}
