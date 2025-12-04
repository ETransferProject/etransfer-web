export class ETransferInstance {
  public unauthorized: boolean;
  public obtainingSignature: boolean;
  public showNoticeIds: string[]; // already show notice
  public processingIds: string[];
  public noticeStorageAddresses: any[];

  constructor() {
    this.unauthorized = false;
    this.obtainingSignature = false;
    this.showNoticeIds = [];
    this.processingIds = [];
    this.noticeStorageAddresses = [];
  }

  setUnauthorized(status: boolean) {
    this.unauthorized = status;
  }

  setObtainingSignature(status: boolean) {
    this.obtainingSignature = status;
  }

  setShowNoticeIds(list: string[]) {
    this.showNoticeIds = list;
  }

  setProcessingIds(list: string[]) {
    this.processingIds = list;
  }
  setNoticeStorageAddresses(list: any[]) {
    this.noticeStorageAddresses = list;
  }
}

export const eTransferInstance = new ETransferInstance();
