import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../theme';

export interface BarDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarDatum[];
  color?: string;
  height?: number;
}

export function BarChart({ data, color = COLORS.purple, height = 110 }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 0);

  if (data.length === 0 || max === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>No data</Text>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      {data.map((d, i) => {
        const ratio = max > 0 ? d.value / max : 0;
        const barHeight = ratio > 0 ? Math.max(ratio * height, 12) : 0;
        return (
          <View key={i} style={styles.col}>
            <View style={[styles.barTrack, { height }]}>
              {d.value > 0 && (
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: color,
                      opacity: ratio > 0.75 ? 1 : 0.6,
                    },
                  ]}
                />
              )}
            </View>
            <Text style={styles.label}>{d.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  col: { flex: 1, alignItems: 'center' },
  barTrack: {
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: { width: '60%', minHeight: 12, borderRadius: 2 },
  label: { color: COLORS.muted, fontSize: 10, marginTop: 4 },
  empty: { alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: COLORS.muted, fontSize: 12 },
});