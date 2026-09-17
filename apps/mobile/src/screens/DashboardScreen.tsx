import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDailyStats, useStreak, useWeeklyStats } from '../hooks/use-stats';
import { useTasks } from '../hooks/use-tasks';
import { useSessions } from '../hooks/use-sessions';
import { useAppStore } from '../store/app-store';
import { COLORS } from '../theme';
import { formatDate, formatDuration, formatMinutes } from '../utils/format';
import { BarChart } from '../components/charts/BarChart';
import { TaskRow } from '../components/features/tasks/TaskRow';
import { Card, CardHeader } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';

const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function DashboardScreen({ navigation }: any) {
  const activeSession = useAppStore((s) => s.activeSession);

  const daily = useDailyStats();
  const streak = useStreak();
  const weekly = useWeeklyStats();
  const activeTasks = useTasks({ status: 'ACTIVE', limit: 5, sortBy: 'createdAt' });
  const sessions = useSessions({ limit: 5 });

  const today = new Date();
  const dateString = `${WEEKDAY_LETTERS[today.getDay()]}, ${formatDate(today)}`;

  const weekDays = (weekly.data?.dailyBreakdown ?? [])
    .slice(0, 7)
    .reverse()
    .map((d) => {
      const date = new Date(d.date);
      return {
        label: WEEKDAY_LETTERS[date.getDay()],
        value: d.focusMinutes,
      };
    });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        {activeSession != null && (
          <View style={styles.sessionBanner}>
            <View style={styles.sessionDot} />
            <View style={styles.sessionTextWrap}>
              <Text style={styles.sessionTitle}>Focus session active</Text>
              <Text style={styles.sessionSub}>
                {activeSession.task?.title ?? 'No task'}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.date}>{dateString}</Text>
          </View>
          <Button size="sm" onPress={() => navigation.navigate('NewTask')}>
            + New Task
          </Button>
        </View>

        {daily.isLoading || streak.isLoading ? (
          <Spinner />
        ) : (
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <StatBox
                label="Tasks Done"
                value={String(daily.data?.tasksCompleted ?? 0)}
                hint="today"
                color={COLORS.accent}
              />
              <StatBox
                label="Focus Time"
                value={`${formatMinutes(daily.data?.focusMinutes ?? 0)}h`}
                hint="today"
                color={COLORS.purple}
              />
            </View>
            <View style={styles.statsRow}>
              <StatBox
                label="Sessions"
                value={String(daily.data?.focusSessions ?? 0)}
                hint="today"
                color={COLORS.blue}
              />
              <StatBox
                label="Streak"
                value={String(streak.data?.streak ?? 0)}
                hint="day(s)"
                color={COLORS.amber}
              />
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Card header={<CardHeader title="This Week - Focus" />}>
            <View style={styles.chartPad}>
              {weekly.isLoading ? (
                <Spinner padding={16} />
              ) : (
                <BarChart data={weekDays} color={COLORS.purple} height={100} />
              )}
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Card header={<CardHeader title="Active Tasks" />}>
            {activeTasks.isLoading ? (
              <Spinner padding={16} />
            ) : activeTasks.data?.data.length ? (
              activeTasks.data.data.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))
            ) : (
              <EmptyState title="No active tasks" description="Great work!" />
            )}
          </Card>
        </View>

        <View style={styles.section}>
          <Card header={<CardHeader title="Recent Sessions" />}>
            {sessions.isLoading ? (
              <Spinner padding={16} />
            ) : sessions.data?.data.length ? (
              sessions.data.data.slice(0, 5).map((s) => (
                <View key={s.id} style={styles.sessionRow}>
                  <Text style={styles.sessionRowTask} numberOfLines={1}>
                    {s.task?.title ?? 'No task'}
                  </Text>
                  <Text style={styles.sessionRowDuration}>
                    {formatDuration(s.duration)}
                  </Text>
                </View>
              ))
            ) : (
              <EmptyState title="No sessions yet" description="Start a focus session" />
            )}
          </Card>
        </View>

        <Pressable style={styles.focusCard} onPress={() => navigation.navigate('Focus')}>
          <Text style={styles.focusTitle}>Start a Focus Session</Text>
          <Text style={styles.focusSub}>Abrir o timer e bloquear apps distractivas →</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value, hint, color }: { label: string; value: string; hint: string; color: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statHint}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 16, gap: 14 },
  sessionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(110, 231, 183, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(110, 231, 183, 0.2)',
    borderRadius: 12,
    padding: 14,
  },
  sessionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent },
  sessionTextWrap: { flex: 1 },
  sessionTitle: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  sessionSub: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { color: COLORS.text, fontSize: 24, fontWeight: '700' },
  date: { color: COLORS.muted, fontSize: 13, marginTop: 2 },
  statsGrid: { gap: 10 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
  },
  statLabel: { color: COLORS.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: 24, fontWeight: '700', marginTop: 4, fontVariant: ['tabular-nums'] },
  statHint: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  section: {},
  chartPad: { padding: 16 },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  sessionRowTask: { flex: 1, color: COLORS.text, fontSize: 13 },
  sessionRowDuration: { color: COLORS.muted, fontSize: 12, fontVariant: ['tabular-nums'] },
  focusCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
    borderRadius: 12,
    padding: 16,
  },
  focusTitle: { color: COLORS.accent, fontSize: 15, fontWeight: '700' },
  focusSub: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
});