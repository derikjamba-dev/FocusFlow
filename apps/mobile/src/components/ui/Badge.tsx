import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { COLORS } from '../../theme';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

const VARIANTS: Record<Variant, { bg: string; text: string; border: string }> = {
  default: { bg: 'transparent', text: COLORS.muted, border: 'rgba(148, 163, 184, 0.2)' },
  success: { bg: 'rgba(110, 231, 183, 0.1)', text: COLORS.accent, border: 'rgba(110, 231, 183, 0.2)' },
  warning: { bg: 'rgba(251, 191, 36, 0.1)', text: COLORS.amber, border: 'rgba(251, 191, 36, 0.2)' },
  danger: { bg: 'rgba(248, 113, 113, 0.1)', text: COLORS.red, border: 'rgba(248, 113, 113, 0.2)' },
  info: { bg: 'rgba(96, 165, 250, 0.1)', text: COLORS.blue, border: 'rgba(96, 165, 250, 0.2)' },
  purple: { bg: 'rgba(167, 139, 250, 0.1)', text: COLORS.purple, border: 'rgba(167, 139, 250, 0.2)' },
};

export function Badge({ children, variant = 'default', size = 'md', style }: BadgeProps) {
  const v = VARIANTS[variant];
  return (
    <View
      style={[
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        { backgroundColor: v.bg, borderColor: v.border },
        style,
      ]}
    >
      <Text style={[styles.text, { color: v.text }, size === 'sm' && styles.textSm]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  sm: { paddingHorizontal: 8, paddingVertical: 2 },
  md: { paddingHorizontal: 10, paddingVertical: 4 },
  text: { fontSize: 12, fontWeight: '500' },
  textSm: { fontSize: 10 },
});