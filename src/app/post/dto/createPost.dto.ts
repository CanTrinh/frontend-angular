export interface CreatePostDto {
  title: string;
  content: string;
  mediaUrl?: string; // Link YouTube hoặc link web nếu có
  type?: string;     // YOUTUBE, LINK, TEXT, MEDIA...
  metadata?: any;    // Thông tin preview của link
  files?: File[];    // DANH SÁCH FILE THỰC TẾ (Ảnh/Video)
}
