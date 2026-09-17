import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSessions } from '../hooks/use-sessions';
import { useMonthlyStats } from '../hooks/use-stats';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';
import { COLORS } from '../theme';
import { formatDuration, formatRelative, formatTime } from '../utils/format';

const PAGE_SIZE = 20;

export default function SessionsScreen() {
  const [page, setPage] = useState(1);

  const monthly = useMonthlyStats();
  const sessions = useSessions({ page, limit: PAGE_SIZE });

  const avgPerSession =
    monthly.data && monthly.data.totalFocusSessions > 0
      ? Math.round(monthly.data.totalFocusMinutes / monthly.data.totalFocusSessions)
      : 0;

  const totalPages = sessions.data?.meta.totalPages ?? 1;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Focus Sessions</Text>
        <Text style={styles.subtitle}>Your deep work history</Text>
      </View>

      {monthly.isLoading ? (
        <Spinner padding={16} />
      ) : (
        <View style={styles.statsGrid}>
          <MonthlyBox
            label="Sessions This Month"
            value={String(monthly.data?.totalFocusSessions ?? 0)}
            hint="completed"
            color={COLORS.purple}
          />
          <MonthlyBox
            label="Focus Time This Month"
            value={`${monthly.data?.totalFocusHours ?? 0}h`}
            hint="total"
            color={COLORS.accent}
          />
          <MonthlyBox
            label="Avg per Session"
            value={avgPerSession > 0 ? `${avgPerSession}m` : '—'}
            hint="average"
            color={COLORS.blue}
          />
        </View>
      )}

      {sessions.isLoading ? (
        <View style={styles.center}>
          <Spinner padding={48} />
        </View>
      ) : sessions.data?.data.length ? (
        <FlatList
          data={sessions.data.data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowTaskWrap}>
                <Text style={styles.rowTask} numberOfLines={1}>
                  {item.task?.title ?? 'No task'}
                </Text>
                <Text style={styles.rowSub}>{formatRelative(item.startedAt)}</Text>
              </View>
              <View style={styles.rowBadge}>
                <Badge
                  variant={item.completed ? 'success' : 'default'}
                >
                  {item.completed ? 'Completed' : 'Stopped'}
                </Badge>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.rowDuration}>{formatDuration(item.duration)}</Text>
                <Text style={styles.rowTime}>{formatTime(item.startedAt)}</Text>
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.center}>
          <EmptyState
            icon="◉"
            title="No sessions yet"
            description="Start a focus session from the timer"
          />
        </View>
      )}

      {totalPages > 1 && (
        <View style={styles.pagination}>
          <Pressable
            style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
            onPress={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <Text style={styles.pageBtnText}>← Prev</Text>
          </Pressable>
          <Text style={styles.pageInfo}>
            Page {page} of {totalPages}
          </Text>
          <Pressable
            style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]}
            onPress={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
          >
            <Text style={styles.pageBtnText}>Next →</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

function MonthlyBox({ label, value, hint, color }: { label: string; value: string; hint: string; color: string }) {
  return (
    <View style={styles.box}>
      <Text style={styles.boxLabel}>{label}</Text>
      <Text style={[styles.boxValue, { color }]}>{value}</Text>
      <Text style={styles.boxHint}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  headerRow: { paddingHorizontal: 16, paddingTop: 16 },
  title: { color: COLORS.text, fontSize: 24, fontWeight: '700' },
  subtitle: { color: COLORS.muted, fontSize: 13, marginTop: 2 },
  statsGrid: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginVertical: 14 },
  box: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
  },
  boxLabel: { color: COLORS.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.3 },
  boxValue: { fontSize: 20, fontWeight: '700', marginTop: 4, fontVariant: ['tabular-nums'] },
  boxHint: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  center: { flex: 1 },
  list: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  rowTaskWrap: { flex: 1 },
  rowTask: { color: COLORS.text, fontSize: 13, fontWeight: '500' },
  rowSub: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  rowBadge: {},
  rowRight: { alignItems: 'flex-end' },
  rowDuration: { color: COLORS.text, fontSize: 12, fontVariant: ['tabular-nums'] },
  rowTime: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: COLORS.border },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  pageBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  pageBtnDisabled: { opacity: 0.4 },
  pageBtnText: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  pageInfo: { color: COLORS.muted, fontSize: 13 },
});