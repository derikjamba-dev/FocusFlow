import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { COLORS } from '../../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  onPress?: () => void;
}

const SIZES: Record<Size, ViewStyle> = {
  sm: { paddingHorizontal: 12, paddingVertical: 6 },
  md: { paddingHorizontal: 16, paddingVertical: 8 },
  lg: { paddingHorizontal: 20, paddingVertical: 10 },
};

const VARIANTS: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: COLORS.accent },
  secondary: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: 'rgba(248, 113, 113, 0.1)', borderWidth: 1, borderColor: 'rgba(248, 113, 113, 0.2)' },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  onPress,
}: ButtonProps) {
  const textColor =
    variant === 'primary' ? COLORS.bg : variant === 'danger' ? COLORS.red : COLORS.text;
  const fontSize = size === 'sm' ? 12 : size === 'md' ? 14 : 16;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        SIZES[size],
        VARIANTS[variant],
        { opacity: disabled || loading ? 0.5 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor, fontSize }]}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  text: { fontWeight: '500' },
});