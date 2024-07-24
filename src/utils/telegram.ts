declare const window: Window &
  typeof globalThis & {
    Telegram?: ITelegram;
  };

export class TelegramPlatform {
  static getTelegram() {
    return window?.Telegram;
  }

  static getWebApp() {
    return TelegramPlatform.getTelegram()?.WebApp;
  }

  static isTelegramPlatform() {
    const Telegram = TelegramPlatform.getTelegram();
    return !!(Telegram && Telegram.WebApp.platform && Telegram.WebApp.platform !== 'unknown');
  }
}
