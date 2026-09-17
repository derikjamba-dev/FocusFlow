import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { FocusBlock } from '../modules/focusBlock';
import type { InstalledApp } from '../modules/focusBlock';
import { getBlocklist, saveBlocklist } from '../storage/blocklist';
import type { BlockedApp } from '../storage/blocklist';
import { COLORS } from '../theme';

const AVATAR_COLORS = ['#7c6af7', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

function initialColor(packageName: string): string {
  let sum = 0;
  for (let i = 0; i < packageName.length; i++) {
    sum += packageName.charCodeAt(i);
  }
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export default function BlocklistScreen({ navigation }: any) {
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [blocked, setBlocked] = useState<Map<string, BlockedApp>>(new Map());
  const [loading, setLoading] = useState(true);
  const [accessibilityEnabled, setAccessibilityEnabled] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [installed, saved, a11y] = await Promise.all([
        FocusBlock?.getInstalledApps() ?? Promise.resolve([]),
        getBlocklist(),
        FocusBlock?.isAccessibilityServiceEnabled() ?? Promise.resolve(false),
      ]);
      setApps(installed);
      const map = new Map<string, BlockedApp>();
      saved.forEach((app) => map.set(app.packageName, app));
      setBlocked(map);
      setAccessibilityEnabled(a11y);
    } catch {
      setApps([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggle = async (app: InstalledApp) => {
    const next = new Map(blocked);
    if (next.has(app.packageName)) {
      next.delete(app.packageName);
    } else {
      next.set(app.packageName, { packageName: app.packageName, label: app.label });
    }
    setBlocked(next);
    await saveBlocklist([...next.values()]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.purple} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {!accessibilityEnabled && (
        <Pressable style={styles.warn} onPress={() => FocusBlock?.openAccessibilitySettings()}>
          <Text style={styles.warnText}>
            ⚠ Acessibilidade desativada. Toca para ativar e permitir o bloqueio de apps.
          </Text>
        </Pressable>
      )}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Seleciona apps a bloquear</Text>
        <Text style={styles.headerSubtitle}>
          Estas apps ficam bloqueadas durante as tuas sessões de foco.{'\n'}
          Bloqueadas: {blocked.size}
        </Text>
      </View>

      <FlatList
        data={apps}
        keyExtractor={(item) => item.packageName}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isBlocked = blocked.has(item.packageName);
          return (
            <Pressable style={[styles.row, isBlocked && styles.rowActive]} onPress={() => toggle(item)}>
              <View style={[styles.avatar, { backgroundColor: initialColor(item.packageName) }]}>
                <Text style={styles.avatarText}>
                  {(item.label || item.packageName).charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.rowText}>
                <Text style={styles.label} numberOfLines={1}>
                  {item.label || item.packageName}
                </Text>
                <Text style={styles.pkg} numberOfLines={1}>
                  {item.packageName}
                </Text>
              </View>
              <Switch
                value={isBlocked}
                onValueChange={() => toggle(item)}
                trackColor={{ false: COLORS.border, true: COLORS.purple }}
                thumbColor="#FFFFFF"
              />
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>Nenhuma aplicação encontrada.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  warn: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    padding: 14,
  },
  warnText: { color: COLORS.amber, fontSize: 13, textAlign: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { color: COLORS.text, fontSize: 20, fontWeight: '700' },
  headerSubtitle: { color: COLORS.muted, fontSize: 13, marginTop: 6 },
  list: { paddingHorizontal: 20, paddingBottom: 24, gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
  },
  rowActive: { borderWidth: 1, borderColor: COLORS.purple },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  rowText: { flex: 1 },
  label: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  pkg: { color: COLORS.muted, fontSize: 12, marginTop: 2, opacity: 0.7 },
  emptyText: { color: COLORS.muted, fontSize: 15 },
});