// src/app/shared/types/post.interface.ts
import { UserStatus } from './user-status.type';

export interface PostMetadata {
  title: string,
  description: string,
  image: any,
  url: string,
  isYoutube: boolean,
}



 export interface CategoryDto {
  id: string; // Thêm trường này
  name: string;
  slug: string;
}


export interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  authorId: string;
  metadata: PostMetadata;
  categories: CategoryDto[];
  author: {
    id: string;
    profilePic: string;
    name: string,
    bio: string
  };
  
  // Trường "ảo" chỉ dùng ở Frontend để hiển thị vòng viền
  authorStatus?: UserStatus; 
  
  // Các thông tin reaction mà chúng ta đã làm ở bước trước
  totalReactions?: number;
  currentUserReaction?: any;
}
