export interface CreatePostDto {
  title: string;
  content: string;
  mediaUrl?: string;
  type?: string;     // YOUTUBE, LINK, TEXT...
  metadata?: any; 
}
