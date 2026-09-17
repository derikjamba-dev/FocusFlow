import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMonthlyStats, useStreak, useWeeklyStats } from '../hooks/use-stats';
import { useTasks } from '../hooks/use-tasks';
import { Spinner } from '../components/ui/Spinner';
import { Card, CardHeader } from '../components/ui/Card';
import { BarChart } from '../components/charts/BarChart';
import { ActivityHeatmap } from '../components/charts/ActivityHeatmap';
import { COLORS } from '../theme';

const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function AnalyticsScreen() {
  const streak = useStreak();
  const weekly = useWeeklyStats();
  const monthly = useMonthlyStats();
  const activeTasks = useTasks({ status: 'ACTIVE', limit: 1 });
  const doneTasks = useTasks({ status: 'COMPLETED', limit: 1 });

  const totalTasks = (activeTasks.data?.meta.total ?? 0) + (doneTasks.data?.meta.total ?? 0);
  const completionRate =
    totalTasks > 0 ? Math.round(((doneTasks.data?.meta.total ?? 0) / totalTasks) * 100) : 0;

  const avgDaily = useMemo(() => {
    const days = monthly.data?.dailyBreakdown ?? [];
    if (days.length === 0) return 0;
    const total = days.reduce((sum, d) => sum + d.focusMinutes, 0);
    return total / days.length;
  }, [monthly.data]);

  const weekDays = useMemo(() => {
    const days = (weekly.data?.dailyBreakdown ?? []).slice(0, 7).reverse();
    return days.map((d) => ({
      label: WEEKDAY_LETTERS[new Date(d.date).getDay()],
      value: d.focusMinutes,
    }));
  }, [weekly.data]);

  const monthDays = useMemo(() => {
    const days = monthly.data?.dailyBreakdown ?? [];
    return days.map((d) => ({
      label: String(new Date(d.date).getDate()),
      value: d.tasksCompleted,
    }));
  }, [monthly.data]);

  const heatmapData = useMemo(() => {
    const days = monthly.data?.dailyBreakdown ?? [];
    return days.slice(0, 84).map((d) => ({
      label: new Date(d.date).toISOString().slice(0, 10),
      value: d.tasksCompleted,
    }));
  }, [monthly.data]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>Your productivity insights</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatBox
              label="Avg Daily Focus"
              value={`${(avgDaily / 60).toFixed(1)}h`}
              hint="this month"
              color={COLORS.purple}
            />
            <StatBox
              label="Completion Rate"
              value={`${completionRate}%`}
              hint="all time"
              color={COLORS.accent}
            />
          </View>
          <View style={styles.statsRow}>
            <StatBox
              label="Best Streak"
              value={String(streak.data?.streak ?? 0)}
              hint="days"
              color={COLORS.amber}
            />
            <StatBox
              label="Tasks Done"
              value={String(doneTasks.data?.meta.total ?? 0)}
              hint="all time"
              color={COLORS.blue}
            />
          </View>
        </View>

        <Card header={<CardHeader title="This Week - Focus Minutes" />}>
          <View style={styles.chartPad}>
            {weekly.isLoading ? <Spinner padding={16} /> : <BarChart data={weekDays} color={COLORS.purple} />}
          </View>
        </Card>

        <Card header={<CardHeader title="This Month - Tasks Completed" />}>
          <View style={styles.chartPad}>
            {monthly.isLoading ? (
              <Spinner padding={16} />
            ) : (
              <BarChart data={monthDays} color={COLORS.accent} />
            )}
          </View>
        </Card>

        {heatmapData.length > 0 && (
          <Card header={<CardHeader title="Activity" />}>
            <View style={styles.chartPad}>
              <ActivityHeatmap data={heatmapData} />
            </View>
          </Card>
        )}
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
  headerRow: {},
  title: { color: COLORS.text, fontSize: 24, fontWeight: '700' },
  subtitle: { color: COLORS.muted, fontSize: 13, marginTop: 2 },
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
  statValue: { fontSize: 22, fontWeight: '700', marginTop: 4, fontVariant: ['tabular-nums'] },
  statHint: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  chartPad: { padding: 16 },
});