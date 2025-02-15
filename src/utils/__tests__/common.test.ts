import { describe, it, expect, vi, Mock } from 'vitest';
import {
  AelfExploreType,
  BlockchainNetworkType,
  LOOP_TOP_TX_URL,
  OtherExploreType,
} from '../../constants/network';
import {
  getAelfExploreLink,
  getOtherExploreLink,
  getTokenAddressExploreHref,
  getTxExploreHref,
  handleInputFocus,
  openWithBlank,
  viewTokenAddressInExplore,
  viewTxDetailInExplore,
} from '../common';
import { EXPLORE_CONFIG, EXPLORE_DOMAIN_CONFIG } from '../../constants/index';
import { isAelfChain } from '../wallet';
import { TelegramPlatform } from '../telegram';
import { devices, sleep } from '@portkey/utils';

// Mock dependencies
vi.mock('../wallet', () => ({
  isAelfChain: vi.fn(),
}));

vi.mock('../telegram', () => ({
  TelegramPlatform: {
    isTelegramPlatform: vi.fn(),
  },
}));

vi.mock('@portkey/utils', () => ({
  devices: {
    isMobile: vi.fn(),
  },
  sleep: vi.fn(),
}));

describe('getAelfExploreLink', () => {
  it('should return the correct transaction link for a given chain', () => {
    const result = getAelfExploreLink('txId123', AelfExploreType.transaction, 'AELF');

    expect(result).toBe(`${EXPLORE_CONFIG.AELF}tx/txId123`);
  });

  it('should return the correct token link for a given chain', () => {
    const result = getAelfExploreLink('tokenId123', AelfExploreType.token, 'AELF');

    expect(result).toBe(`${EXPLORE_DOMAIN_CONFIG.AELF}multiChain/token/tokenId123`);
  });

  it('should return the correct block link for a given chain', () => {
    const result = getAelfExploreLink('blockId123', AelfExploreType.block, 'tDVV');

    expect(result).toBe(`${EXPLORE_CONFIG.tDVV}block/blockId123`);
  });

  it('should return the correct address link for a given chain (default case)', () => {
    const result = getAelfExploreLink('address123', AelfExploreType.address, 'tDVW');

    expect(result).toBe(`${EXPLORE_CONFIG.tDVW}address/address123`);
  });

  it('should use the default case if type is undefined', () => {
    // Note that invalid type should default to "address"
    const result = getAelfExploreLink(
      'address456',
      undefined as unknown as AelfExploreType,
      'tDVW',
    );

    expect(result).toBe(`${EXPLORE_CONFIG.tDVW}address/address456`);
  });
});

describe('getOtherExploreLink', () => {
  const mockData = 'mockData';
  const mockNetworkUrls = {
    ETH: 'https://etherscan.io',
    TRX: 'https://tronscan.io',
    BSC: 'https://bscscan.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return correct transaction link for ETH', () => {
    const result = getOtherExploreLink(mockData, OtherExploreType.transaction, 'ETH');

    expect(result).toBe(`${mockNetworkUrls.ETH}/tx/${mockData}`);
  });

  it('should return correct transaction link for TRX', () => {
    const result = getOtherExploreLink(mockData, OtherExploreType.transaction, 'TRX');

    expect(result).toBe(`${mockNetworkUrls.TRX}/#/transaction/${mockData}`);
  });

  it('should return correct address link for ETH', () => {
    const result = getOtherExploreLink(mockData, OtherExploreType.address, 'ETH');

    expect(result).toBe(`${mockNetworkUrls.ETH}/address/${mockData}`);
  });

  it('should return correct address link for TRX', () => {
    const result = getOtherExploreLink(mockData, OtherExploreType.address, 'TRX');

    expect(result).toBe(`${mockNetworkUrls.TRX}/#/address/${mockData}`);
  });

  it('should return correct address link when type is default', () => {
    const result = getOtherExploreLink(mockData, undefined as any, 'BSC'); // Testing default case

    expect(result).toBe(`${mockNetworkUrls.BSC}/address/${mockData}`);
  });
});

describe('openWithBlank', () => {
  it('should open a new window with the given URL', () => {
    const url = 'http://example.com';
    const mockWindow = { opener: {}, close: vi.fn() };
    (window as any).open = vi.fn().mockReturnValue(mockWindow);

    openWithBlank(url);

    expect(window.open).toHaveBeenCalledWith(url, '_blank');
    expect(mockWindow.opener).toBeNull(); // Ensure opener is set to null
  });
});

describe('viewTxDetailInExplore', () => {
  it('should open URL with Cobo hash', () => {
    const mockWindow = { opener: {}, close: vi.fn() };
    (window as any).open = vi.fn().mockReturnValue(mockWindow);

    const txHash = 'mockTxHash';
    const isCoboHash = true;

    viewTxDetailInExplore('ETH', txHash, isCoboHash);
  });

  it('should open AELF explore link when network is AELF and chainId is provided', () => {
    const txHash = 'mockTxHash';
    const isCoboHash = false;
    const chainId = 'AELF';

    viewTxDetailInExplore(BlockchainNetworkType.AELF, txHash, isCoboHash, chainId);
  });

  it('should open Other Explore link for other networks', () => {
    const txHash = 'mockTxHash';
    const isCoboHash = false;

    viewTxDetailInExplore('someOtherNetwork', txHash, isCoboHash);
  });
});

describe('getTxExploreHref', () => {
  const mockTxHash = 'mockTransactionHash';

  it('should return the Cobo Hash transaction URL if isCoboHash is true', () => {
    const result = getTxExploreHref('some-network', mockTxHash, true);
    expect(result).toBe(`${LOOP_TOP_TX_URL}${mockTxHash}`);
  });

  it('should call getAelfExploreLink if isAelfChain returns true and chainId is provided', () => {
    const mockChainId = 'AELF';
    const mockNetwork = 'AELF';

    // Mock isAelfChain to return true
    const isAelfChainMock = vi.fn().mockReturnValue(true);
    vi.mocked(isAelfChain).mockImplementation(isAelfChainMock);

    const result = getTxExploreHref(mockNetwork, mockTxHash, false, mockChainId);

    // Assert
    expect(isAelfChainMock).toHaveBeenCalledWith(mockNetwork);
    expect(result).toBe('https://testnet.aelfscan.io/AELF/tx/mockTransactionHash');
  });

  it('should call getOtherExploreLink in the default case', () => {
    const mockNetwork = 'ETH';

    // Mock isAelfChain to return false
    const isAelfChainMock = vi.fn().mockReturnValue(false);
    vi.mocked(isAelfChain).mockImplementation(isAelfChainMock);

    const result = getTxExploreHref(mockNetwork, mockTxHash, false);

    // Assert
    expect(isAelfChainMock).toHaveBeenCalledWith(mockNetwork);
    expect(result).toBe('https://etherscan.io/tx/mockTransactionHash');
  });

  it('should call getAelfExploreLink if isAelfChain return correct', () => {
    const mockNetwork = 'AELF';
    const mockChainId = 'AELF';

    // Mock isAelfChain to return true
    const isAelfChainMock = vi.fn().mockReturnValue(true);
    vi.mocked(isAelfChain).mockImplementation(isAelfChainMock);

    const result = getTxExploreHref(mockNetwork, mockTxHash, false, mockChainId);

    // Assert
    expect(isAelfChainMock).toHaveBeenCalledWith(mockNetwork);
    expect(result).toBe('https://testnet.aelfscan.io/AELF/tx/mockTransactionHash');
  });

  it('should handle invalid or undefined chainId with a non-CoboHash and Aelf network', () => {
    const mockNetwork = 'AELF';

    // Mock isAelfChain to return true
    const isAelfChainMock = vi.fn().mockReturnValue(true);
    vi.mocked(isAelfChain).mockImplementation(isAelfChainMock);

    const result = getTxExploreHref(mockNetwork, mockTxHash, false);

    // Assert
    expect(isAelfChainMock).toHaveBeenCalledWith(mockNetwork);
    expect(result).toBe('undefined/tx/mockTransactionHash');
  });
});

describe('getTokenAddressExploreHref', () => {
  const symbol = 'USDT';
  const mockChainId = 'tDVW';
  const mockAddress = 'mockAddress123';
  const mockNetwork = 'AELF';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return Aelf token explore URL if network is an Aelf chain and chainId is provided', () => {
    // Mock isAelfChain to return true
    vi.mocked(isAelfChain).mockReturnValue(true);

    const result = getTokenAddressExploreHref(mockNetwork, symbol, mockChainId);

    // Assertions
    expect(isAelfChain).toHaveBeenCalledWith(mockNetwork);
    expect(result).toBe(`https://testnet.aelfscan.io/multiChain/token/${symbol}`);
  });

  it('should return Other token explore URL if address is provided', () => {
    const mockNetwork = 'ETH';
    // Mock isAelfChain to return false
    vi.mocked(isAelfChain).mockReturnValue(false);

    const result = getTokenAddressExploreHref(mockNetwork, symbol, undefined, mockAddress);

    // Assertions
    expect(isAelfChain).toHaveBeenCalledWith(mockNetwork);
    expect(result).toBe(`https://etherscan.io/address/${mockAddress}`);
  });

  it('should return an empty string if neither chainId nor address is provided', () => {
    // Mock isAelfChain to return false
    vi.mocked(isAelfChain).mockReturnValue(false);

    const result = getTokenAddressExploreHref(mockNetwork, symbol);

    // Assertions
    expect(isAelfChain).toHaveBeenCalledWith(mockNetwork);
    expect(result).toBe('');
  });

  it('should return an empty string if chainId is missing for an Aelf chain', () => {
    // Mock isAelfChain to return true
    vi.mocked(isAelfChain).mockReturnValue(true);

    const result = getTokenAddressExploreHref(mockNetwork, symbol);

    // Assertions
    expect(isAelfChain).toHaveBeenCalledWith(mockNetwork);
    expect(result).toBe('');
  });
});

describe('viewTokenAddressInExplore', () => {
  const mockNetwork = 'AELF';
  const mockSymbol = 'USDT';
  const mockChainId = 'tDVW';
  const mockAddress = 'mockAddress123';

  it('should return Aelf token explore URL', () => {
    // Mock isAelfChain to return true
    vi.mocked(isAelfChain).mockReturnValue(true);

    const mockWindow = { opener: {}, close: vi.fn() };
    (window as any).open = vi.fn().mockReturnValue(mockWindow);

    viewTokenAddressInExplore(mockNetwork, mockSymbol, mockChainId, mockAddress);

    expect(window.open).toHaveBeenCalled();
  });
});

describe('handleInputFocus', () => {
  let mockScrollIntoView: Mock;

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Mock `document.getElementById` and its behavior
    mockScrollIntoView = vi.fn();
    vi.spyOn(document, 'getElementById').mockImplementation(() => {
      return {
        scrollIntoView: mockScrollIntoView, // Mock scrollIntoView method
      } as unknown as HTMLElement;
    });
  });

  it('should scroll the input into view on Android when NOT in Telegram platform', async () => {
    // Mock `devices.isMobile()` to return an Android device
    (devices.isMobile as Mock).mockReturnValue({
      android: {
        device: true, // Simulate Android device
      },
    });

    // Mock `TelegramPlatform.isTelegramPlatform()` to return false
    (TelegramPlatform.isTelegramPlatform as Mock).mockReturnValue(false);

    // Call the function
    await handleInputFocus('test-input');

    // Assert `sleep` was called
    expect(sleep).toHaveBeenCalledWith(200);

    // Assert scrollIntoView was called with correct options
    expect(mockScrollIntoView).toHaveBeenCalledWith({
      block: 'center',
      behavior: 'smooth',
    });

    // Assert `document.getElementById` was called with the correct ID
    expect(document.getElementById).toHaveBeenCalledWith('test-input');
  });

  it('should NOT scroll into view if the device is NOT Android', async () => {
    // Mock `devices.isMobile()` to return a non-Android device
    (devices.isMobile as Mock).mockReturnValue({
      android: {
        device: false, // Simulate non-Android device
      },
    });

    // Mock `TelegramPlatform.isTelegramPlatform()` to return false
    (TelegramPlatform.isTelegramPlatform as Mock).mockReturnValue(false);

    // Call the function
    await handleInputFocus('test-input');

    // Assert `sleep` was NOT called
    expect(sleep).not.toHaveBeenCalled();

    // Assert scrollIntoView was NOT called
    expect(mockScrollIntoView).not.toHaveBeenCalled();
  });

  it('should NOT scroll into view if running in Telegram platform', async () => {
    // Mock `devices.isMobile()` to return an Android device
    (devices.isMobile as Mock).mockReturnValue({
      android: {
        device: true, // Simulate Android device
      },
    });

    // Mock `TelegramPlatform.isTelegramPlatform()` to return true
    (TelegramPlatform.isTelegramPlatform as Mock).mockReturnValue(true);

    // Call the function
    await handleInputFocus('test-input');

    // Assert `sleep` was NOT called
    expect(sleep).not.toHaveBeenCalled();

    // Assert scrollIntoView was NOT called
    expect(mockScrollIntoView).not.toHaveBeenCalled();
  });

  it('should NOT throw an error when document.getElementById returns null', async () => {
    // Mock `devices.isMobile()` to return an Android device
    (devices.isMobile as Mock).mockReturnValue({
      android: {
        device: true, // Simulate Android device
      },
    });

    // Mock `TelegramPlatform.isTelegramPlatform()` to return false
    (TelegramPlatform.isTelegramPlatform as Mock).mockReturnValue(false);

    // Mock `document.getElementById` to return null
    vi.spyOn(document, 'getElementById').mockReturnValue(null);

    // Call the function
    await handleInputFocus('non-existing-id');

    // Assert `sleep` was called
    expect(sleep).toHaveBeenCalledWith(200);

    // Assert `scrollIntoView` was not called (element is null)
    expect(mockScrollIntoView).not.toHaveBeenCalled();
  });
});
