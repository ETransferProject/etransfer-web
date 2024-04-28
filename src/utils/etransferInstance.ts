class ETransferInstance {
  public obtainingToken: boolean;

  constructor() {
    this.obtainingToken = false;
  }

  setObtainingToken(status: boolean) {
    this.obtainingToken = status;
  }
}

export const eTransferInstance = new ETransferInstance();
