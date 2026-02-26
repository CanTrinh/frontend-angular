export interface PostDto {
  id: number;
  createdAt: string;   // backend sends ISO string
  updatedAt: string;
  title: string;
  content: string;
  image?: string;
  video?: string;
  link?: string;
  published: boolean;
  authorId: number;
  categories: CategoryDto[];
}

export interface CategoryDto {
  id: number;
  name: string;
}
