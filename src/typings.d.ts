declare module 'quill' {
  const Quill: any;
  export const Delta: any; // Thêm dòng này để đánh lừa compiler
  export default Quill;
}
declare module 'quill-magic-url';
