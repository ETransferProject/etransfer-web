import { describe, it, expect, beforeEach } from 'vitest';
import { ETransferInstance } from '../etransferInstance';

describe('ETransferInstance', () => {
  let instance: ETransferInstance;

  beforeEach(() => {
    // Recreate a fresh instance for each test
    instance = new ETransferInstance();
  });

  /**
   * Test Initialization
   */
  it('should initialize with default values', () => {
    expect(instance.unauthorized).toBe(false);
    expect(instance.obtainingSignature).toBe(false);
    expect(instance.showNoticeIds).toEqual([]);
    expect(instance.processingIds).toEqual([]);
    expect(instance.noticeStorageAddresses).toEqual([]);
  });

  /**
   * Test setUnauthorized
   */
  it('should set unauthorized correctly', () => {
    instance.setUnauthorized(true);
    expect(instance.unauthorized).toBe(true);

    instance.setUnauthorized(false);
    expect(instance.unauthorized).toBe(false);
  });

  /**
   * Test setObtainingSignature
   */
  it('should set obtainingSignature correctly', () => {
    instance.setObtainingSignature(true);
    expect(instance.obtainingSignature).toBe(true);

    instance.setObtainingSignature(false);
    expect(instance.obtainingSignature).toBe(false);
  });

  /**
   * Test setShowNoticeIds
   */
  it('should set showNoticeIds correctly', () => {
    const ids = ['id1', 'id2', 'id3'];
    instance.setShowNoticeIds(ids);
    expect(instance.showNoticeIds).toEqual(ids);

    const newIds = ['id4', 'id5'];
    instance.setShowNoticeIds(newIds);
    expect(instance.showNoticeIds).toEqual(newIds);
  });

  /**
   * Test setProcessingIds
   */
  it('should set processingIds correctly', () => {
    const ids = ['proc1', 'proc2'];
    instance.setProcessingIds(ids);
    expect(instance.processingIds).toEqual(ids);

    const newIds = ['proc3', 'proc4'];
    instance.setProcessingIds(newIds);
    expect(instance.processingIds).toEqual(newIds);
  });

  /**
   * Test setNoticeStorageAddresses
   */
  it('should set noticeStorageAddresses correctly', () => {
    const addresses = [{ address: 'addr1' }, { address: 'addr2' }];
    instance.setNoticeStorageAddresses(addresses);
    expect(instance.noticeStorageAddresses).toEqual(addresses);

    const newAddresses = [{ address: 'addr3' }];
    instance.setNoticeStorageAddresses(newAddresses);
    expect(instance.noticeStorageAddresses).toEqual(newAddresses);
  });
});
