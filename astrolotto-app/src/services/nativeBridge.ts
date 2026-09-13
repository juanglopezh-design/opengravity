import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';

export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const initNativeApp = async (): Promise<void> => {
  if (Capacitor.isNativePlatform()) {
    try {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#0a0d14' });
    } catch (e) {
      console.warn('Native status bar initialization note:', e);
    }
  }
};

export const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Medium): Promise<void> => {
  try {
    if (Capacitor.isPluginAvailable('Haptics')) {
      await Haptics.impact({ style });
    }
  } catch {
    // Graceful fallback for non-supported browsers
  }
};

export const triggerSuccessHaptic = async (): Promise<void> => {
  try {
    if (Capacitor.isPluginAvailable('Haptics')) {
      await Haptics.notification({ type: NotificationType.Success });
    }
  } catch {
    // Graceful fallback
  }
};
