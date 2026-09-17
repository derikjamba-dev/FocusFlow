import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { COLORS } from '../../theme';

interface SpinnerProps {
  size?: number;
  padding?: number;
}

export function Spinner({ size = 24, padding = 24 }: SpinnerProps) {
  return (
    <View style={[styles.container, { padding }]}>
      <ActivityIndicator size="large" color={COLORS.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});