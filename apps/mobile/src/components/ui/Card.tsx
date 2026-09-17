import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { COLORS } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, header, footer, style }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {header != null && <View style={styles.header}>{header}</View>}
      <View style={styles.body}>{children}</View>
      {footer != null && <View style={styles.footer}>{footer}</View>}
    </View>
  );
}

export function CardHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <View style={styles.headerRow}>
      <Text style={styles.title}>{title}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  body: {},
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 12,
  },
});