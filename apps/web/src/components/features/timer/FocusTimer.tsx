'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../../../store/app-store';
import { useStartSession, useCompleteSession } from '../../../lib/hooks/use-sessions';
import { useTasks } from '../../../lib/hooks/use-tasks';
import { cn } from '../../../lib/utils';

const PRESETS = [
  { label: '25m', seconds: 25 * 60 },
  { label: '50m', seconds: 50 * 60 },
  { label: '90m', seconds: 90 * 60 },
  { label: 'Custom', seconds: null },
];

const CIRC = 2 * Math.PI * 54;

function playAlarm() {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const playTone = (start: number, freq: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.3, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur);
    };

    for (let i = 0; i < 4; i++) {
      const t = now + i * 0.5;
      playTone(t, 800 + i * 100, 0.4);
    }

    setTimeout(() => ctx.close(), 3000);
  } catch {
    // Audio not supported
  }
}

export function FocusTimer() {
  const [modeIdx, setModeIdx] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [remaining, setRemaining] = useState(PRESETS[0].seconds!);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const alarmPlayedRef = useRef(false);
  const { activeSession, setActiveSession } = useAppStore();
  const startSession = useStartSession();
  const completeSession = useCompleteSession();
  const { data: tasksData } = useTasks({ status: 'ACTIVE', limit: 20 });

  const isCustom = modeIdx === PRESETS.length - 1;
  const total = isCustom ? customMinutes * 60 : PRESETS[modeIdx].seconds!;
  const progress = remaining / total;
  const offset = CIRC * (1 - progress);
  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  const secs = String(remaining % 60).padStart(2, '0');

  useEffect(() => {
    if (running) {
      alarmPlayedRef.current = false;
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            if (!alarmPlayedRef.current) {
              alarmPlayedRef.current = true;
              playAlarm();
            }
            if (activeSession) {
              completeSession.mutate(activeSession.id);
            }
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
    }
    return () => clearInterval(intervalRef.current!);
  }, [running, activeSession, completeSession]);

  const handleToggle = () => {
    if (!running && !activeSession) {
      startSession.mutate({});
    }
    setRunning((r) => !r);
  };

  const handleStop = () => {
    setRunning(false);
    if (activeSession) completeSession.mutate(activeSession.id);
    setRemaining(total);
  };

  const handleReset = () => {
    setRunning(false);
    setRemaining(total);
  };

  const handleMode = (i: number) => {
    setModeIdx(i);
    setRunning(false);
    if (i < PRESETS.length - 1) {
      setRemaining(PRESETS[i].seconds!);
    } else {
      setRemaining(customMinutes * 60);
    }
  };

  const handleCustomChange = (val: string) => {
    const m = Math.max(1, Math.min(999, Number(val) || 1));
    setCustomMinutes(m);
    if (isCustom) {
      setRunning(false);
      setRemaining(m * 60);
    }
  };

  const timerDone = remaining === 0 && !running;

  return (
    <div className="flex flex-col items-center py-5 px-4">
      {timerDone && (
        <div className="text-[10px] font-medium text-accent mb-2 animate-pulse">
          Time&apos;s up!
        </div>
      )}

      <div className="relative w-[130px] h-[130px] mb-5">
        <svg width="130" height="130" viewBox="0 0 130 130" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="65" cy="65" r="54" fill="none" stroke="#1e2130" strokeWidth="7"/>
          <circle
            cx="65" cy="65" r="54" fill="none"
            stroke={running ? '#6ee7b7' : timerDone ? '#f59e0b' : '#7c6af7'}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-2xl font-semibold text-text tabular-nums">{minutes}:{secs}</span>
          <span className="text-[10px] text-muted mt-0.5">
            {timerDone ? 'Done' : running ? 'Focusing' : activeSession ? 'Paused' : 'Ready'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <button onClick={handleReset} className="w-9 h-9 rounded-full bg-card border border-border text-muted hover:text-text hover:border-border2 transition-all text-sm flex items-center justify-center">
          ↺
        </button>
        <button
          onClick={handleToggle}
          disabled={startSession.isPending}
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center text-bg font-semibold text-base transition-all active:scale-95',
            running ? 'bg-amber hover:bg-amber/80' : 'bg-accent hover:bg-accent2',
          )}
        >
          {running ? '⏸' : '▶'}
        </button>
        {activeSession && (
          <button onClick={handleStop} className="w-9 h-9 rounded-full bg-red/10 border border-red/20 text-red hover:bg-red/20 transition-all text-sm flex items-center justify-center">
            ■
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        {PRESETS.map((m, i) => (
          <button
            key={m.label}
            onClick={() => handleMode(i)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-mono border transition-all',
              i === modeIdx
                ? 'bg-accent/10 border-accent/30 text-accent'
                : 'bg-transparent border-border text-muted hover:border-border2 hover:text-text',
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {isCustom && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={999}
            value={customMinutes}
            onChange={(e) => handleCustomChange(e.target.value)}
            className="w-20 px-2 py-1 text-xs font-mono text-center bg-card border border-border rounded-lg text-text focus:outline-none focus:border-accent"
          />
          <span className="text-[10px] text-muted font-mono">minutes</span>
        </div>
      )}
    </div>
  );
}
