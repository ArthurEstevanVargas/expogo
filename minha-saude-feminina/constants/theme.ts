/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const AppColors = {
  background: '#FFF8F5',
  surface: '#FFFFFF',
  text: '#302A2C',
  mutedText: '#6F6267',
  border: '#EBDDD8',
  primary: '#B85C72',
  primaryForeground: '#FFFFFF',
  coral: '#D96C75',
  peach: '#E9A37E',
  lavender: '#8E79B8',
  sage: '#6F9A83',
  accent: '#C58A4B',
  danger: '#B42318',
  success: '#26734D',
  softCoral: '#FCE6E4',
  softPeach: '#FBE9DA',
  softLavender: '#EEE8F8',
  softSage: '#E5F0EA',
  softAccent: '#F5E8D4',
};

const tintColorLight = AppColors.primary;
const tintColorDark = AppColors.primaryForeground;

export const Colors = {
  light: {
    text: AppColors.text,
    background: AppColors.background,
    tint: tintColorLight,
    icon: AppColors.mutedText,
    tabIconDefault: AppColors.mutedText,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#F8F2F0',
    background: '#241E20',
    tint: tintColorDark,
    icon: '#D9C8C3',
    tabIconDefault: '#D9C8C3',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
