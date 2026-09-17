import { NativeModules } from 'react-native';

export interface InstalledApp {
  packageName: string;
  label: string;
}

export interface BlockState {
  active: boolean;
  unlocksUsed: number;
  unlockLimit: number;
  graceRemainingMs: number;
}

interface FocusBlockNative {
  startBlocking(
    packages: string[],
    options: { graceSeconds: number; unlockLimit: number },
  ): void;
  stopBlocking(): void;
  hasBlockedPackages(): Promise<boolean>;
  isAccessibilityServiceEnabled(): Promise<boolean>;
  getBlockState(): Promise<BlockState>;
  openAccessibilitySettings(): void;
  getInstalledApps(): Promise<InstalledApp[]>;
}

export const FocusBlock = NativeModules.FocusBlock as FocusBlockNative | undefined;

export const GRACE_SECONDS = 30;
export const UNLOCK_LIMIT = 2;