import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTasks, useCompleteTask, useDeleteTask } from '../hooks/use-tasks';
import { TaskRow } from '../components/features/tasks/TaskRow';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { COLORS } from '../theme';

type Filter = 'ALL' | 'ACTIVE' | 'COMPLETED' | 'HIGH';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'COMPLETED', label: 'Done' },
  { key: 'HIGH', label: 'High' },
];

const PAGE_SIZE = 25;

export default function TasksScreen({ navigation }: any) {
  const [filter, setFilter] = useState<Filter>('ALL');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const complete = useCompleteTask();
  const remove = useDeleteTask();

  const params = useMemo(() => {
    const p: { status?: 'ACTIVE' | 'COMPLETED'; priority?: 'HIGH'; page: number; limit: number; sortBy: string } = {
      page,
      limit: PAGE_SIZE,
      sortBy: 'createdAt',
    };
    if (filter === 'ACTIVE') p.status = 'ACTIVE';
    if (filter === 'COMPLETED') p.status = 'COMPLETED';
    if (filter === 'HIGH') p.priority = 'HIGH';
    return p;
  }, [filter, page]);

  const { data, isLoading, refetch } = useTasks(params);

  const rawTasks = useMemo(() => data?.data ?? [], [data]);
  const tasks = useMemo(() => {
    if (!search.trim()) {
      return rawTasks;
    }
    const q = search.toLowerCase();
    return rawTasks.filter((t) => t.title.toLowerCase().includes(q));
  }, [rawTasks, search]);

  const total = data?.meta.total ?? 0;
  const hasMore = data?.meta.hasMore ?? false;
  const totalPages = data?.meta.totalPages ?? 1;

  const changeFilter = (f: Filter) => {
    setFilter(f);
    setPage(1);
  };

  const onComplete = (id: string) => {
    complete.mutate(id);
  };

  const onDelete = (id: string, title: string) => {
    Alert.alert('Delete task', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove.mutate(id) },
    ]);
  };

  const openNewTask = () => {
    navigation.navigate('NewTask', { onCreated: () => refetch() });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Tasks</Text>
          <Text style={styles.subtitle}>{total} total</Text>
        </View>
        <Button size="sm" onPress={openNewTask}>
          + New Task
        </Button>
      </View>

      <View style={styles.toolbar}>
        <TextInput
          style={styles.search}
          placeholder="Search tasks..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
        <View style={styles.filters}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.key}
              style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
              onPress={() => changeFilter(f.key)}
            >
              <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <Spinner padding={48} />
        </View>
      ) : tasks.length === 0 ? (
        <View style={styles.center}>
          {search.trim() ? (
            <EmptyState icon="◫" title="No matching tasks" description="Try a different search" />
          ) : (
            <EmptyState
              icon="◫"
              title="No tasks here"
              description="Create your first task to get started"
              actionLabel="+ New Task"
              onAction={openNewTask}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>
                Showing {tasks.length} of {total}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TaskRow
              task={item}
              onComplete={onComplete}
              onDelete={(id) => onDelete(id, item.title)}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
        />
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
            style={[styles.pageBtn, !hasMore && styles.pageBtnDisabled]}
            onPress={() => setPage((p) => p + 1)}
            disabled={!hasMore}
          >
            <Text style={styles.pageBtnText}>Next →</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: { color: COLORS.text, fontSize: 24, fontWeight: '700' },
  subtitle: { color: COLORS.muted, fontSize: 13, marginTop: 2 },
  toolbar: { paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  search: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 14,
  },
  filters: { flexDirection: 'row', gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: 'rgba(110, 231, 183, 0.1)',
    borderColor: 'rgba(110, 231, 183, 0.3)',
  },
  filterText: { color: COLORS.muted, fontSize: 12, fontWeight: '500' },
  filterTextActive: { color: COLORS.accent },
  center: { flex: 1 },
  list: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    margin: 16,
    marginBottom: 8,
    overflow: 'hidden',
  },
  listHeader: { paddingHorizontal: 16, paddingTop: 12 },
  listHeaderText: { color: COLORS.muted, fontSize: 12 },
  listSeparator: { height: StyleSheet.hairlineWidth, backgroundColor: COLORS.border },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 16,
  },
  pageBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  pageBtnDisabled: { opacity: 0.4 },
  pageBtnText: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  pageInfo: { color: COLORS.muted, fontSize: 13 },
});