import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';

export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const initNativeApp = async (): Promise<void> => {
  if (Capacitor.isNativePlatform()) {
    try {
      await StatusBar.setStyle({ style: Style.Dark });
      // setBackgroundColor is only fully supported on Android
      if (Capacitor.getPlatform() === 'android') {
        await StatusBar.setBackgroundColor({ color: '#06070e' });
      }
    } catch (e) {
      console.warn('Native status bar initialization note:', e);
    }

    // Handle Android hardware back button — prevent accidental exits
    if (Capacitor.getPlatform() === 'android') {
      App.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          // Show a soft toast / do nothing (don't exit immediately)
          // App stays open on first back press; second press exits
          App.exitApp();
        } else {
          window.history.back();
        }
      });
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

