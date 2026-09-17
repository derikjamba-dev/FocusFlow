import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Vibration,
  View,
} from 'react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import beepWav from '../../assets/beep.wav';
import { useCompleteSession, useStartSession } from '../hooks/use-sessions';
import { useAppStore } from '../store/app-store';
import { FocusBlock, GRACE_SECONDS, UNLOCK_LIMIT } from '../modules/focusBlock';
import type { BlockState } from '../modules/focusBlock';
import { getBlocklist } from '../storage/blocklist';
import { COLORS } from '../theme';

const BASE_PRESETS = [
  { label: '25m', seconds: 25 * 60 },
  { label: '50m', seconds: 50 * 60 },
  { label: '90m', seconds: 90 * 60 },
  { label: 'Custom', seconds: null as number | null },
];

const RADIUS = 130 / 2 - 3.5;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function TimerScreen({ navigation }: any) {
  const [modeIdx, setModeIdx] = useState(0);
  const [customMinutes, setCustomMinutes] = useState('');
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [accessibilityEnabled, setAccessibilityEnabled] = useState(false);
  const [blockState, setBlockState] = useState<BlockState | null>(null);

  const activeSession = useAppStore((s) => s.activeSession);
  const startSession = useStartSession();
  const completeSession = useCompleteSession();

  const endAtRef = useRef<number>(0);
  const playerRef = useRef<any>(null);

  const selected = BASE_PRESETS[modeIdx];
  const total =
    selected.seconds ?? (Number(customMinutes) > 0 ? Number(customMinutes) * 60 : 25 * 60);

  const refreshBlockState = useCallback(async () => {
    if (!FocusBlock) {
      return;
    }
    try {
      const [a11y, state] = await Promise.all([
        FocusBlock.isAccessibilityServiceEnabled(),
        FocusBlock.getBlockState(),
      ]);
      setAccessibilityEnabled(a11y);
      setBlockState(state);
    } catch {
      // no-op
    }
  }, []);

  const ensurePlayer = useCallback(async () => {
    if (playerRef.current) {
      return playerRef.current;
    }
    try {
      await setAudioModeAsync({ playsInSilentMode: true });
      const player = createAudioPlayer(beepWav);
      playerRef.current = player;
      return player;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    ensurePlayer();
    return () => {
      try {
        playerRef.current?.release();
        playerRef.current = null;
      } catch {
        // no-op
      }
    };
  }, [ensurePlayer]);

  useEffect(() => {
    refreshBlockState();
    const interval = setInterval(refreshBlockState, 5000);
    return () => clearInterval(interval);
  }, [refreshBlockState]);

  const stopBlocking = useCallback(() => {
    FocusBlock?.stopBlocking();
    refreshBlockState();
  }, [refreshBlockState]);

  const playAlarm = useCallback(async () => {
    try {
      const player = await ensurePlayer();
      if (player) {
        player.seekTo(0);
        player.play();
      }
    } catch {
      // sound unavailable
    }
    Vibration.vibrate(800);
  }, [ensurePlayer]);

  useEffect(() => {
    if (!running) {
      return;
    }
    const interval = setInterval(() => {
      const left = Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        clearInterval(interval);
        setRunning(false);
        stopBlocking();
        playAlarm();
        if (activeSession) {
          completeSession.mutate(activeSession.id);
        }
      }
    }, 250);
    return () => clearInterval(interval);
  }, [running, activeSession, completeSession, stopBlocking, playAlarm]);

  const handleStop = useCallback(() => {
    setRunning(false);
    stopBlocking();
    if (activeSession) {
      completeSession.mutate(activeSession.id);
    }
    setRemaining(total);
  }, [activeSession, completeSession, stopBlocking, total]);

  const handleToggle = useCallback(async () => {
    if (running) {
      handleStop();
      return;
    }

    try {
      if (!activeSession) {
        try {
          await startSession.mutateAsync(undefined);
        } catch (err) {
          const detail = axios.isAxiosError(err)
            ? (err.response?.data?.message as string | undefined) || err.message
            : 'Não foi possível iniciar a sessão de foco.';
          Alert.alert('Não foi possível iniciar a sessão', detail);
        }
      }

      const blocked = await getBlocklist();
      if (blocked.length > 0 && FocusBlock) {
        if (accessibilityEnabled) {
          FocusBlock.startBlocking(
            blocked.map((a) => a.packageName),
            { graceSeconds: GRACE_SECONDS, unlockLimit: UNLOCK_LIMIT },
          );
        } else {
          setAccessibilityEnabled(false);
          Alert.alert(
            'Acessibilidade desativada',
            'Ativa o serviço de acessibilidade para bloquear apps durante o modo foco.',
          );
        }
      }

      endAtRef.current = Date.now() + total * 1000;
      setRemaining(total);
      setRunning(true);
      refreshBlockState();
    } catch {
      Alert.alert('Erro', 'Não foi possível iniciar a sessão de foco.');
    }
  }, [running, activeSession, startSession, total, accessibilityEnabled, handleStop, refreshBlockState]);

  const selectPreset = (idx: number) => {
    if (running || activeSession) {
      return;
    }
    setModeIdx(idx);
    if (BASE_PRESETS[idx].seconds != null) {
      setRemaining(BASE_PRESETS[idx].seconds);
    } else {
      setCustomOpen(true);
      setRemaining(Number(customMinutes) > 0 ? Number(customMinutes) * 60 : 25 * 60);
    }
  };

  const applyCustom = () => {
    const mins = Number(customMinutes);
    if (mins > 0 && mins <= 999) {
      setRemaining(mins * 60);
    }
    setCustomOpen(false);
  };

  const done = remaining === 0 && !running;
  const ringColor = done ? COLORS.amber : running ? COLORS.accent : COLORS.purple;
  const progressOffset = CIRCUMFERENCE * (1 - remaining / total);
  const statusLabel = done
    ? 'Done'
    : running
      ? 'Focusing'
      : activeSession
        ? 'Paused'
        : 'Ready';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.presets}>
          {BASE_PRESETS.map((p, idx) => (
            <Pressable
              key={p.label}
              style={[styles.presetChip, idx === modeIdx && styles.presetChipActive]}
              onPress={() => selectPreset(idx)}
            >
              <Text style={[styles.presetText, idx === modeIdx && styles.presetTextActive]}>
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {done && (
          <Text style={styles.timesUp}>Time’s up!</Text>
        )}

        <View style={styles.ringWrap}>
          <Svg width={130} height={130}>
            <Circle
              cx={65}
              cy={65}
              r={RADIUS}
              stroke={COLORS.border}
              strokeWidth={7}
              fill="none"
            />
            <Circle
              cx={65}
              cy={65}
              r={RADIUS}
              stroke={ringColor}
              strokeWidth={7}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={progressOffset}
              transform="rotate(-90 65 65)"
            />
          </Svg>
          <View style={styles.ringCenter}>
            <Text style={styles.time}>{formatTime(remaining)}</Text>
            <Text style={styles.status}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <Pressable style={styles.roundBtn} onPress={() => selectPreset(modeIdx)}>
            <Text style={styles.roundBtnText}>↺</Text>
          </Pressable>
          <Pressable style={[styles.playBtn, running && styles.playBtnPause]} onPress={handleToggle}>
            <Text style={styles.playText}>{running ? '❚❚' : '▶'}</Text>
          </Pressable>
          {activeSession != null && (
            <Pressable style={[styles.roundBtn, styles.stopBtn]} onPress={handleStop}>
              <Text style={styles.stopText}>■</Text>
            </Pressable>
          )}
        </View>

        {!accessibilityEnabled && (
          <Pressable style={styles.warn} onPress={() => FocusBlock?.openAccessibilitySettings()}>
            <Text style={styles.warnText}>
              ⚠ Ativa o serviço de acessibilidade para bloquear apps durante o foco
            </Text>
          </Pressable>
        )}

        {blockState?.active && (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Desbloqueios usados: {blockState.unlocksUsed}/{blockState.unlockLimit}
            </Text>
            <Text style={styles.infoText}>
              App bloqueada durante o foco. Podes desbloquear temporariamente por{' '}
              {GRACE_SECONDS}s (máx {UNLOCK_LIMIT} por sessão).
            </Text>
          </View>
        )}

        <View style={styles.links}>
          <Pressable style={styles.link} onPress={() => navigation.navigate('Blocklist')}>
            <Text style={styles.linkText}>Apps bloqueadas →</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={customOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCustomOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Custom minutes</Text>
            <TextInput
              style={styles.customInput}
              value={customMinutes}
              onChangeText={setCustomMinutes}
              keyboardType="number-pad"
              autoFocus
              placeholder="25"
              placeholderTextColor={COLORS.muted}
            />
            <Text style={styles.modalHint}>Minutes (1-999)</Text>
            <View style={styles.modalActions}>
              <Pressable style={styles.modalBtn} onPress={() => setCustomOpen(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={applyCustom}>
                <Text style={styles.modalBtnPrimaryText}>Apply</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flexGrow: 1, padding: 24, alignItems: 'center', gap: 22 },
  presets: { flexDirection: 'row', gap: 8 },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
  },
  presetChipActive: {
    backgroundColor: 'rgba(110, 231, 183, 0.1)',
    borderColor: 'rgba(110, 231, 183, 0.3)',
  },
  presetText: { color: COLORS.muted, fontSize: 13, fontWeight: '500' },
  presetTextActive: { color: COLORS.accent },
  timesUp: { color: COLORS.accent, fontSize: 12, fontWeight: '600' },
  ringWrap: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  status: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  roundBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundBtnText: { color: COLORS.text, fontSize: 16 },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnPause: { backgroundColor: COLORS.amber },
  playText: { color: COLORS.bg, fontSize: 18, fontWeight: '700' },
  stopBtn: {
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderColor: 'rgba(248, 113, 113, 0.2)',
  },
  stopText: { color: COLORS.red, fontSize: 14 },
  warn: {
    width: '100%',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderRadius: 12,
    padding: 14,
  },
  warnText: { color: COLORS.amber, fontSize: 13, textAlign: 'center' },
  infoCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  infoText: { color: COLORS.muted, fontSize: 13 },
  links: { width: '100%', alignItems: 'center' },
  link: { padding: 8 },
  linkText: { color: COLORS.purple, fontSize: 14, fontWeight: '600' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  customInput: {
    marginTop: 16,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  modalHint: { color: COLORS.muted, fontSize: 12, marginTop: 6, textAlign: 'center' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  modalBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalBtnText: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  modalBtnPrimary: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  modalBtnPrimaryText: { color: COLORS.bg, fontSize: 13, fontWeight: '700' },
});