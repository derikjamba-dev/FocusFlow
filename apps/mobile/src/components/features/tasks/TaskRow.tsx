import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, PRIORITY_COLORS, PRIORITY_LABELS } from '../../../theme';
import type { Task } from '../../../api/tasks';
import { formatRelative } from '../../../utils/format';

interface TaskRowProps {
  task: Task;
  compact?: boolean;
  onComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
  isDone?: boolean;
}

export function TaskRow({ task, compact = false, onComplete, onDelete, isDone }: TaskRowProps) {
  const done = isDone ?? task.status === 'COMPLETED';
  const overdue =
    !done && task.dueDate != null && new Date(task.dueDate) < new Date() ? true : false;

  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.checkbox, done && styles.checkboxDone]}
        onPress={() => onComplete?.(task.id)}
      >
        {done && <Text style={styles.check}>{'✓'}</Text>}
      </Pressable>

      <View style={styles.body}>
        <Text style={[styles.title, done && styles.titleDone]} numberOfLines={1}>
          {task.title}
        </Text>
        {!compact && (
          <View style={styles.meta}>
            <View
              style={[
                styles.priorityBadge,
                { borderColor: `${PRIORITY_COLORS[task.priority]}40` },
              ]}
            >
              <Text style={[styles.priorityText, { color: PRIORITY_COLORS[task.priority] }]}>
                {PRIORITY_LABELS[task.priority]}
              </Text>
            </View>
            {task.dueDate != null && (
              <Text style={[styles.due, overdue && styles.dueOverdue]}>
                {formatRelative(task.dueDate)}
              </Text>
            )}
            <Text style={styles.sessions}>◉ {task.focusSessionsCount}</Text>
          </View>
        )}
      </View>

      {onDelete != null && (
        <Pressable onPress={() => onDelete(task.id)} hitSlop={8} style={styles.deleteBtn}>
          <Text style={styles.deleteIcon}>🗑</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxDone: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  check: { color: COLORS.bg, fontSize: 12, fontWeight: '700', lineHeight: 14 },
  body: { flex: 1 },
  title: { color: COLORS.text, fontSize: 14 },
  titleDone: { color: COLORS.muted, textDecorationLine: 'line-through' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  priorityBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  priorityText: { fontSize: 10, fontWeight: '500' },
  due: { fontSize: 11, color: COLORS.muted, fontVariant: ['tabular-nums'] },
  dueOverdue: { color: COLORS.red },
  sessions: { fontSize: 11, color: COLORS.muted, fontVariant: ['tabular-nums'] },
  deleteBtn: { padding: 4 },
  deleteIcon: { fontSize: 13, opacity: 0.7 },
});