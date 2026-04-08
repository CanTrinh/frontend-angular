// Thay URL này bằng Domain CloudFront của bạn
const CLOUDFRONT_BASE_URL = 'https://cdn.ctlife.xyz';

export const REACTION_MAP = {
  LIKE: `${CLOUDFRONT_BASE_URL}/static/images/reactions/like_v1.svg`,
  LOVE: `${CLOUDFRONT_BASE_URL}/static/images/reactions/love_v1.svg`,
  HAHA: `${CLOUDFRONT_BASE_URL}/static/images/reactions/haha_v1.svg`,
  WOW: `${CLOUDFRONT_BASE_URL}/static/images/reactions/wow_v1.svg`,
  SAD: `${CLOUDFRONT_BASE_URL}/static/images/reactions/sad_v1.svg`,
  ANGRY: `${CLOUDFRONT_BASE_URL}/static/images/reactions/angry_v1.svg`,
} as const;



// Helper để lấy danh sách dùng cho vòng lặp (nếu cần)
export const REACTION_LIST = [
  { type: 'LIKE', label: 'Thích', url: REACTION_MAP.LIKE },
  { type: 'LOVE', label: 'Yêu thích', url: REACTION_MAP.LOVE },
  { type: 'HAHA', label: 'Haha', url: REACTION_MAP.HAHA },
  { type: 'WOW', label: 'Wow', url: REACTION_MAP.WOW },
  { type: 'SAD', label: 'Buồn', url: REACTION_MAP.SAD },
  { type: 'ANGRY', label: 'Phẫn nộ', url: REACTION_MAP.ANGRY },
];
