declare module 'quill' {
  export interface Delta {
    ops?: any[];
    [key: string]: any;
  }
  const Quill: any;
  export const Delta: any; 
  export default Quill;
}

declare module 'quill-magic-url';
