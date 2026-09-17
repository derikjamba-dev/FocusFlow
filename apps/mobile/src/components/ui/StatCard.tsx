import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../theme';

interface StatCardProps {
  label: string;
  value: string;
  hint: string;
  color: string;
}

export function StatCard({ label, value, hint, color }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.hint}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    flex: 1,
  },
  label: { color: COLORS.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 22, fontWeight: '700', marginTop: 4, fontVariant: ['tabular-nums'] },
  hint: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
});