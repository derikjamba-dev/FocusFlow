import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = '□', title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {description != null && <Text style={styles.description}>{description}</Text>}
      {actionLabel != null && onAction != null && (
        <View style={styles.action}>
          <Button variant="secondary" onPress={onAction}>
            {actionLabel}
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 16 },
  icon: { fontSize: 40, opacity: 0.3, color: COLORS.muted, marginBottom: 8 },
  title: { color: COLORS.text, fontSize: 14, fontWeight: '500' },
  description: { color: COLORS.muted, fontSize: 12, marginTop: 4, textAlign: 'center' },
  action: { marginTop: 12 },
});