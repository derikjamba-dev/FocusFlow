import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../theme';

interface HeatmapDatum {
  label: string;
  value: number;
}

interface ActivityHeatmapProps {
  data: HeatmapDatum[];
  cellSize?: number;
}

function intensity(value: number, max: number): number {
  const ratio = max > 0 ? value / max : 0;
  if (ratio <= 0) return 0.1;
  if (ratio < 0.3) return 0.3;
  if (ratio < 0.6) return 0.6;
  return 1;
}

export function ActivityHeatmap({ data, cellSize = 15 }: ActivityHeatmapProps) {
  const max = Math.max(...data.map((d) => d.value), 0);

  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No data</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.grid}>
        {data.map((d, i) => (
          <View
            key={i}
            style={[
              styles.cell,
              {
                width: cellSize,
                height: cellSize,
                backgroundColor: `rgba(110, 231, 183, ${intensity(d.value, max)})`,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.legend}>
        <Text style={styles.legendText}>Less</Text>
        {[0.1, 0.3, 0.6, 1].map((o, i) => (
          <View key={i} style={[styles.legendCell, { backgroundColor: `rgba(110, 231, 183, ${o})` }]} />
        ))}
        <Text style={styles.legendText}>More</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { color: COLORS.muted, fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  cell: { borderRadius: 2 },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 10,
  },
  legendCell: { width: 12, height: 12, borderRadius: 2 },
  legendText: { color: COLORS.muted, fontSize: 10, marginHorizontal: 2 },
});