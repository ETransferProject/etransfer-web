interface HTMLAttributes<T> {
  scrollTop?: number;
}

declare interface ICallSendResponse {
  TransactionId: string;
}

declare interface File extends Blob {
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/File/lastModified) */
  readonly lastModified: number;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/File/name) */
  readonly name: string;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/File/webkitRelativePath) */
  readonly webkitRelativePath: string;
  readonly originFileObj: any;
}

declare module 'aelf-sdk';
declare module 'query-string';
declare module 'qs';

declare namespace AElf {
  function ajax(url: string, settings?: any): void;
}
