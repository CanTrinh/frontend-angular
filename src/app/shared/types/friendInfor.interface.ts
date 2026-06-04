 export interface FriendInforDto {
  userId: string,
  status: string,
  friend:{
    id: string;
    name: string;
    profilePic: string;
  }
}