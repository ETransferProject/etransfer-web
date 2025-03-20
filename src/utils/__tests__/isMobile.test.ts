import { afterEach, describe, it, expect, vi } from 'vitest';
import isMobile, { isMobileDevices } from '../isMobile';

describe('isMobile', () => {
  // Utility function to mock `navigator` for tests
  function mockNavigator(userAgent: string, platform?: string, maxTouchPoints?: number) {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: userAgent,
        platform: platform || '',
        maxTouchPoints: maxTouchPoints || 0,
      },
      writable: true,
    });
  }

  afterEach(() => {
    // Reset any mocks after each test
    vi.resetModules();
  });

  /**
   * Apple Devices Tests
   */
  describe('Apple devices', () => {
    it('should detect an iPhone', () => {
      mockNavigator(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
      );

      const result = isMobile();

      expect(result.apple.phone).toBe(true);
      expect(result.apple.device).toBe(true);
      expect(result.phone).toBe(true);
      expect(result.tablet).toBe(false);
    });

    it('should detect an iPad running iOS 13', () => {
      mockNavigator(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.2 Safari/605.1.15',
        'MacIntel',
        5,
      );

      const result = isMobile();

      expect(result.apple.tablet).toBe(true);
      expect(result.apple.device).toBe(true);
      expect(result.phone).toBe(false);
      expect(result.tablet).toBe(true);
    });

    it('should detect an iPod', () => {
      mockNavigator(
        'Mozilla/5.0 (iPod; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/603.3.8 (KHTML, like Gecko) Mobile/14E277',
      );

      const result = isMobile();

      expect(result.apple.ipod).toBe(true);
      expect(result.apple.device).toBe(true);
      expect(result.phone).toBe(true);
      expect(result.tablet).toBe(false);
    });

    it('should not falsely identify other devices as Apple', () => {
      mockNavigator(
        'Mozilla/5.0 (Linux; Android 10; Pixel 4 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36',
      );

      const result = isMobile();

      expect(result.apple.device).toBe(false);
    });
  });

  /**
   * Android Devices Tests
   */
  describe('Android devices', () => {
    it('should detect an Android mobile phone', () => {
      mockNavigator(
        'Mozilla/5.0 (Linux; Android 10; Pixel 4 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Mobile Safari/537.36',
      );

      const result = isMobile();

      expect(result.android.phone).toBe(true);
      expect(result.android.device).toBe(true);
      expect(result.phone).toBe(true);
      expect(result.tablet).toBe(false);
    });

    it('should detect an Android tablet', () => {
      mockNavigator(
        'Mozilla/5.0 (Linux; Android 9; SM-T720 Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.89 Safari/537.36',
      );

      const result = isMobile();

      expect(result.android.tablet).toBe(true);
      expect(result.android.device).toBe(true);
      expect(result.phone).toBe(false);
      expect(result.tablet).toBe(true);
    });

    it('should not falsely identify non-Android devices as Android', () => {
      mockNavigator(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      );

      const result = isMobile();

      expect(result.android.device).toBe(false);
    });
  });

  /**
   * Windows Devices Tests
   */
  describe('Windows devices', () => {
    it('should detect a Windows phone', () => {
      mockNavigator(
        'Mozilla/5.0 (Windows Phone 10.0; Android 6.0.1; Microsoft; Lumia 950 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Mobile Safari/537.36 Edge/15.14900',
      );

      const result = isMobile();

      expect(result.windows.phone).toBe(true);
      expect(result.windows.device).toBe(true);
      expect(result.phone).toBe(true);
    });

    it('should detect a Windows tablet', () => {
      mockNavigator(
        'Mozilla/5.0 (Windows NT 10.0; ARM; Surface Pro X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36',
      );

      const result = isMobile();

      expect(result.windows.tablet).toBe(true);
      expect(result.windows.device).toBe(true);
      expect(result.tablet).toBe(true);
    });
  });

  /**
   * Windows Devices Tests
   */
  describe('Windows devices', () => {
    it('should detect a Windows phone', () => {
      mockNavigator(
        'Mozilla/5.0 (Windows Phone 10.0; Android 6.0.1; Microsoft; Lumia 950 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Mobile Safari/537.36 Edge/15.14900',
      );

      const result = isMobile();

      expect(result.windows.phone).toBe(true);
      expect(result.windows.device).toBe(true);
      expect(result.phone).toBe(true);
    });

    it('should detect a Windows tablet', () => {
      mockNavigator(
        'Mozilla/5.0 (Windows NT 10.0; ARM; Surface Pro X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36',
      );

      const result = isMobile();

      expect(result.windows.tablet).toBe(true);
      expect(result.windows.device).toBe(true);
      expect(result.tablet).toBe(true);
    });
  });

  /**
   * Other Devices Tests
   */
  describe('Other devices', () => {
    it('should detect an Opera Mini browser', () => {
      mockNavigator(
        'Opera/9.80 (Android; Opera Mini/36.2.2254/120.147; U; en) Presto/2.12.423 Version/12.16',
      );

      const result = isMobile();

      expect(result.other.opera).toBe(true);
      expect(result.other.device).toBe(true);
    });

    it('should detect a Firefox mobile browser', () => {
      mockNavigator('Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0');

      const result = isMobile();

      expect(result.other.firefox).toBe(true);
      expect(result.other.device).toBe(true);
    });

    it('should detect a Chrome mobile browser', () => {
      mockNavigator(
        'Mozilla/5.0 (Linux; Android 9; Pixel 3 XL Build/PQ3A.190705.001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Mobile Safari/537.36',
      );

      const result = isMobile();

      expect(result.other.chrome).toBe(true);
      expect(result.other.device).toBe(true);
    });
  });

  /**
   * Custom Params Tests
   */
  describe('Custom Params', () => {
    const operaAndroidAgent =
      'Opera/9.80 (Android; Opera Mini/36.2.2254/120.147; U; en) Presto/2.12.423 Version/12.16';
    const facebookIOSAgent = `Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBDV/iPhone14,2;FBMD/iPhone;FBSN/iOS;FBSV/16.3;FBSS/3;FBCR/T-Mobile;FBLC/en_US;FBOP/5]`;
    const twitterIOSAgent =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Twitter/9.59.1';

    it('should detect an Opera Mini browser with string params', () => {
      const result = isMobile(operaAndroidAgent);

      expect(result.android.device).toBe(true);
      expect(result.other.opera).toBe(true);
      expect(result.other.device).toBe(true);
    });

    it('should detect an Opera Mini browser with object params', () => {
      const params = {
        userAgent: operaAndroidAgent,
        platform: 'MacIntel',
        maxTouchPoints: 5,
      };

      const result = isMobile(params);

      expect(result.android.device).toBe(true);
      expect(result.other.opera).toBe(true);
      expect(result.other.device).toBe(true);
    });

    it('should detect an Opera Mini browser with object params and without maxTouchPoints', () => {
      const params = {
        userAgent: operaAndroidAgent,
        platform: 'MacIntel',
      };

      const result = isMobile(params);

      expect(result.android.device).toBe(true);
      expect(result.other.opera).toBe(true);
      expect(result.other.device).toBe(true);
    });

    it('should detect an Facebook iOS with object params and without maxTouchPoints', () => {
      const result = isMobile(facebookIOSAgent);

      expect(result.apple.phone).toBe(true);
      expect(result.apple.device).toBe(true);
      expect(result.phone).toBe(true);
    });

    it('should detect an Twitter iOS with object params and without maxTouchPoints', () => {
      const result = isMobile(twitterIOSAgent);

      expect(result.apple.phone).toBe(true);
      expect(result.apple.device).toBe(true);
      expect(result.phone).toBe(true);
    });
  });
});

/**
 * isMobileDevices Tests
 */
describe('isMobileDevices', () => {
  // Utility function to mock `navigator` for tests
  function mockNavigator(userAgent: string, platform?: string, maxTouchPoints?: number) {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: userAgent,
        platform: platform || '',
        maxTouchPoints: maxTouchPoints || 0,
      },
      writable: true,
    });
  }

  afterEach(() => {
    // Reset any mocks after each test
    vi.resetModules();
  });

  it('should return true for Apple or Android devices', () => {
    mockNavigator(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
    );

    const result = isMobileDevices();

    expect(result).toBe(true);
  });

  it('should return false for non-mobile devices', () => {
    mockNavigator(
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    );

    const result = isMobileDevices();

    expect(result).toBe(false);
  });
});
