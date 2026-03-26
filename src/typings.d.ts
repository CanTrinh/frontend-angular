declare module 'quill' {
  export interface Quill {
    root: HTMLElement;
    clipboard: any;
    getSelection(focus?: boolean): any;
    insertEmbed(index: number, format: string, value: any, source?: string): any;
    setSelection(index: number, length?: number, source?: string): any;
    // Thêm các method khác nếu bạn cần dùng
  }

  export interface Delta {
    ops?: any[];
  }

  const Quill: any;
  export const Delta: any;
  export default Quill;
}

// Định nghĩa bí danh cho ngx-quill tìm thấy
declare type QuillType = import('quill').Quill;
declare type Delta = import('quill').Delta;

declare module 'quill-magic-url';
