import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { PostService } from './post.service'; // Đường dẫn tới service của bạn
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const postResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const postService = inject(PostService);
  const postId = route.paramMap.get('id');

  if (!postId) return of(null);

  // Gọi API lấy chi tiết bài viết
  return postService.getPost(postId).pipe(
    catchError(() => {
      console.error('Không tìm thấy bài viết');
      return of(null); // Trả về null nếu lỗi để tránh treo router
    })
  );
};
