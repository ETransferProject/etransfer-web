class ETransferInstance {
  public obtainingToken: boolean;
  public obtainingSignature: boolean;

  constructor() {
    this.obtainingToken = false;
    this.obtainingSignature = false;
  }

  setObtainingToken(status: boolean) {
    this.obtainingToken = status;
  }

  setObtainingSignature(status: boolean) {
    this.obtainingSignature = status;
  }
}

export const eTransferInstance = new ETransferInstance();
