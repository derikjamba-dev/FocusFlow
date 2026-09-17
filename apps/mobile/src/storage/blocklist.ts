import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BlockedApp {
  packageName: string;
  label: string;
}

const BLOCKLIST_KEY = 'focusflow:blocklist';

export async function getBlocklist(): Promise<BlockedApp[]> {
  try {
    const raw = await AsyncStorage.getItem(BLOCKLIST_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw) as BlockedApp[];
  } catch {
    return [];
  }
}

export async function saveBlocklist(apps: BlockedApp[]): Promise<void> {
  await AsyncStorage.setItem(BLOCKLIST_KEY, JSON.stringify(apps));
}