class ETransferInstance {
  public unauthorized: boolean;
  public obtainingSignature: boolean;
  public showNoticeIds: string[]; // already show notice
  public processingIds: string[];

  constructor() {
    this.unauthorized = false;
    this.obtainingSignature = false;
    this.showNoticeIds = [];
    this.processingIds = [];
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
}

export const eTransferInstance = new ETransferInstance();
