import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, {
  type DateTimePickerChangeEvent,
} from '@react-native-community/datetimepicker';
import { useCreateTask } from '../hooks/use-tasks';
import { Button } from '../components/ui/Button';
import { COLORS, PRIORITY_COLORS, PRIORITY_LABELS } from '../theme';

interface NewTaskScreenProps {
  navigation: any;
  route: any;
}

export default function NewTaskScreen({ navigation, route }: NewTaskScreenProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCreateTask();
  const onCreated = route.params?.onCreated;

  const submit = () => {
    setError(null);
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    create.mutate(
      {
        title: title.trim(),
        priority,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
      },
      {
        onSuccess: () => {
          onCreated?.();
          navigation.goBack();
        },
        onError: (err) => {
          const detail = axios.isAxiosError(err)
            ? (err.response?.data?.message as string | undefined) || err.message
            : 'Failed to create task';
          setError(detail);
        },
      },
    );
  };

  const onSubmit = (event: DateTimePickerChangeEvent, date: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    setDueDate(date);
  };

  const onDismiss = () => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>New Task</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="What needs to be done?"
            placeholderTextColor={COLORS.muted}
            value={title}
            onChangeText={setTitle}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={submit}
          />
        </View>

        <View style={styles.rowFields}>
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.segment}>
              {(Object.keys(PRIORITY_LABELS) as ('LOW' | 'MEDIUM' | 'HIGH')[]).map((p) => (
                <Pressable
                  key={p}
                  style={[styles.segmentBtn, priority === p && styles.segmentBtnActive]}
                  onPress={() => setPriority(p)}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      priority === p && { color: PRIORITY_COLORS[p], fontWeight: '700' },
                    ]}
                  >
                    {PRIORITY_LABELS[p]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Due Date</Text>
          {Platform.OS === 'android' && showPicker ? (
            <DateTimePicker
              value={dueDate ?? new Date()}
              mode="date"
              display="default"
              onValueChange={onSubmit}
              onDismiss={onDismiss}
            />
          ) : (
            <Pressable style={styles.dateBtn} onPress={() => setShowPicker(true)}>
              <Text style={dueDate ? styles.dateText : styles.datePlaceholder}>
                {dueDate ? dueDate.toDateString() : 'No due date'}
              </Text>
              {dueDate != null && (
                <Pressable
                  onPress={() => setDueDate(null)}
                  hitSlop={10}
                  style={styles.clearBtn}
                >
                  <Text style={styles.clearText}>Clear</Text>
                </Pressable>
              )}
            </Pressable>
          )}
        </View>

        {error != null && <Text style={styles.error}>{error}</Text>}

        <View style={styles.actions}>
          <Button variant="ghost" style={styles.actionBtn} onPress={() => navigation.goBack()}>
            Cancel
          </Button>
          <Button style={styles.actionBtn} loading={create.isPending} onPress={submit}>
            Add Task
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 20, gap: 18 },
  title: { color: COLORS.text, fontSize: 20, fontWeight: '700' },
  field: { gap: 6 },
  rowFields: { flexDirection: 'row' },
  fieldHalf: { flex: 1 },
  label: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 14,
  },
  segment: { flexDirection: 'row', gap: 6 },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  segmentBtnActive: { backgroundColor: COLORS.card, borderColor: COLORS.border2 },
  segmentText: { color: COLORS.muted, fontSize: 12 },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateText: { color: COLORS.text, fontSize: 14 },
  datePlaceholder: { color: COLORS.muted, fontSize: 14 },
  clearBtn: {},
  clearText: { color: COLORS.muted, fontSize: 12 },
  error: { color: COLORS.red, fontSize: 12 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  actionBtn: { flex: 1 },
});