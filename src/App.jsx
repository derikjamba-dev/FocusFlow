import { useState, useEffect, useRef, useCallback } from "react";

// ── Google Fonts ──────────────────────────────────────────────────────────────
const FontLink = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=IBM+Plex+Mono:wght@300;400;500;600&family=IBM+Plex+Sans:wght@300;400;500&display=swap');
  `}</style>
);

// ── Design tokens ─────────────────────────────────────────────────────────────
const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:       #07080d;
    --surface:  #0e0f17;
    --card:     #13151f;
    --border:   #1e2130;
    --accent:   #6ee7b7;
    --accent2:  #34d399;
    --warn:     #fb923c;
    --danger:   #f87171;
    --muted:    #4b5270;
    --text:     #e2e5f0;
    --textDim:  #8892ad;
    --mono:     'IBM Plex Mono', monospace;
    --serif:    'Playfair Display', serif;
    --sans:     'IBM Plex Sans', sans-serif;
    --r:        12px;
    --r-lg:     20px;
  }
  body { 
    background: var(--bg); 
    color: var(--text); 
    font-family: var(--sans);
    overflow-x: hidden;
  }
  
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
  
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(110,231,183,0.4); }
    70%  { transform: scale(1);    box-shadow: 0 0 0 18px rgba(110,231,183,0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(110,231,183,0); }
  }
  @keyframes timerPulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.6; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .fadeUp { animation: fadeUp 0.4s ease both; }
  .fadeUp-1 { animation-delay: 0.05s; }
  .fadeUp-2 { animation-delay: 0.1s; }
  .fadeUp-3 { animation-delay: 0.15s; }
  .fadeUp-4 { animation-delay: 0.2s; }
  .fadeUp-5 { animation-delay: 0.25s; }
  
  /* Responsive */
  @media (max-width: 640px) {
    .desktop-nav { display: none !important; }
    .mobile-menu-btn { display: block !important; }
    .mobile-menu-overlay { display: block !important; }
    .timer-svg { max-width: 220px !important; }
  }
  @media (max-width: 400px) {
    .timer-svg { max-width: 200px !important; }
  }
  @media (min-width: 641px) {
    .mobile-menu-btn { display: none !important; }
  }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().slice(0, 10);
const isOverdue = (task) => task.dueDate && task.dueDate < today() && task.status === "active";

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

function selectNextTask(tasks) {
  const active = tasks.filter((t) => t.status === "active");
  if (!active.length) return null;
  return active.sort((a, b) => {
    const aOver = isOverdue(a) ? 0 : 1;
    const bOver = isOverdue(b) ? 0 : 1;
    if (aOver !== bOver) return aOver - bOver;
    const aPri = PRIORITY_ORDER[a.priority] ?? 1;
    const bPri = PRIORITY_ORDER[b.priority] ?? 1;
    if (aPri !== bPri) return aPri - bPri;
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return new Date(a.createdAt) - new Date(b.createdAt);
  })[0];
}

function fmt(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────
const PriorityBadge = ({ p }) => {
  const map = { high: ["#f87171","#2a1515"], medium: ["#fb923c","#261810"], low: ["#6ee7b7","#0d1f1a"] };
  const [col, bg] = map[p] || map.low;
  return (
    <span style={{
      fontFamily: "var(--mono)", fontSize: "clamp(9px, 2vw, 10px)", fontWeight: 600, letterSpacing: 1,
      textTransform: "uppercase", color: col, background: bg,
      padding: "2px 8px", borderRadius: 100, border: `1px solid ${col}33`,
      whiteSpace: "nowrap",
    }}>{p}</span>
  );
};

const StatCard = ({ label, value, accent, delay }) => (
  <div className={`fadeUp fadeUp-${delay}`} style={{
    background: "var(--card)", border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)", padding: "20px 24px",
    position: "relative", overflow: "hidden",
  }}>
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, height: 2,
      background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
    }} />
    <div style={{ fontFamily: "var(--mono)", fontSize: "clamp(28px, 7vw, 32px)", fontWeight: 600, color: accent, lineHeight: 1 }}>{value}</div>
    <div style={{ marginTop: 6, fontSize: "clamp(11px, 2.5vw, 12px)", color: "var(--textDim)", fontFamily: "var(--mono)", letterSpacing: 0.5 }}>{label}</div>
  </div>
);

// ── Main App ──────────────────────────────────────────────────────────────────
export default function FocusFlow() {
  // ── State ────────────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ff_tasks") || "[]"); } catch { return []; }
  });
  const [stats, setStats] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ff_stats") || "{}"); } catch { return {}; }
  });
  const [view, setView] = useState("dashboard"); // dashboard | tasks | focus
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", dueDate: "", priority: "medium" });
  const [editId, setEditId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [timerSec, setTimerSec] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [toast, setToast] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const intervalRef = useRef(null);

  // ── Persistence ──────────────────────────────────────────────────────────
  useEffect(() => { localStorage.setItem("ff_tasks", JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem("ff_stats", JSON.stringify(stats)); }, [stats]);

  // ── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        setTimerSec((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setTimerRunning(false);
            setTimerDone(true);
            recordSession();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerRunning]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const todayStr = today();
  const todayStats = stats[todayStr] || { completed: 0, sessions: 0 };
  const streak = calcStreak(stats);
  const activeTasks = tasks.filter((t) => t.status === "active");
  const todayCompleted = tasks.filter((t) => t.completedAt?.startsWith(todayStr));

  // ── Handlers ─────────────────────────────────────────────────────────────
  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }

  function recordSession() {
    const d = today();
    setStats((prev) => ({
      ...prev,
      [d]: { completed: (prev[d]?.completed || 0), sessions: (prev[d]?.sessions || 0) + 1 }
    }));
    if (selectedTask) {
      setTasks((prev) => prev.map((t) =>
        t.id === selectedTask.id ? { ...t, focusSessionsCount: (t.focusSessionsCount || 0) + 1 } : t
      ));
    }
    showToast("🎉 Focus session complete! Great work.");
  }

  function addTask() {
    if (!form.title.trim()) return;
    if (editId) {
      setTasks((prev) => prev.map((t) => t.id === editId ? { ...t, ...form } : t));
      setEditId(null);
      showToast("Task updated.");
    } else {
      const newTask = { id: Date.now(), ...form, status: "active", createdAt: new Date().toISOString(), completedAt: null, focusSessionsCount: 0 };
      setTasks((prev) => [newTask, ...prev]);
      showToast("Task added.");
    }
    setForm({ title: "", dueDate: "", priority: "medium" });
    setAddOpen(false);
  }

  function completeTask(id) {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: "completed", completedAt: new Date().toISOString() } : t));
    const d = today();
    setStats((prev) => ({ ...prev, [d]: { sessions: (prev[d]?.sessions || 0), completed: (prev[d]?.completed || 0) + 1 } }));
    if (selectedTask?.id === id) { setSelectedTask(null); setTimerRunning(false); setTimerSec(25 * 60); setTimerDone(false); }
    showToast("✅ Task completed!");
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (selectedTask?.id === id) { setSelectedTask(null); setTimerRunning(false); setTimerSec(25 * 60); setTimerDone(false); }
    showToast("Task removed.");
  }

  function startEdit(task) {
    setForm({ title: task.title, dueDate: task.dueDate || "", priority: task.priority });
    setEditId(task.id);
    setAddOpen(true);
  }

  function pickTask() {
    const next = selectNextTask(tasks);
    if (!next) { showToast("No active tasks. Add some tasks first!", "warn"); return; }
    setSelectedTask(next);
    setTimerSec(25 * 60);
    setTimerRunning(false);
    setTimerDone(false);
    setView("focus");
  }

  function resetTimer() {
    setTimerRunning(false);
    setTimerSec(25 * 60);
    setTimerDone(false);
  }

  const progress = 1 - timerSec / (25 * 60);
  const circumference = 2 * Math.PI * 110;

  return (
    <>
      <style>{css}</style>
      <FontLink />
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
        
        {/* ── Header ── */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: "1px solid var(--border)",
          background: "var(--surface)", position: "sticky", top: 0, zIndex: 100,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, var(--accent2), #059669)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
            }}>⚡</div>
            <span style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>FocusFlow</span>
          </div>
          
          {/* Desktop nav */}
          <nav style={{ display: "flex", gap: 4 }} className="desktop-nav">
            {["dashboard","tasks","focus"].map((v) => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                fontFamily: "var(--mono)", fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.8,
                background: view === v ? "var(--accent)" : "transparent",
                color: view === v ? "#07080d" : "var(--textDim)",
                transition: "all 0.2s",
              }}>{v}</button>
            ))}
          </nav>
          
          {/* Mobile hamburger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
            style={{
              display: "none", background: "transparent", border: "1px solid var(--border)",
              padding: "8px 12px", borderRadius: 8, cursor: "pointer", color: "var(--text)",
              fontSize: 18,
            }}
          >☰</button>
        </header>
        
        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 99,
              display: "none",
            }}
            className="mobile-menu-overlay"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "fixed", top: 72, right: 20, background: "var(--surface)",
                border: "1px solid var(--border)", borderRadius: "var(--r-lg)",
                padding: "12px", minWidth: 180, animation: "fadeUp 0.2s ease",
              }}
            >
              {["dashboard","tasks","focus"].map((v) => (
                <button 
                  key={v} 
                  onClick={() => { setView(v); setMobileMenuOpen(false); }}
                  style={{
                    width: "100%", padding: "12px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                    fontFamily: "var(--mono)", fontSize: 13, fontWeight: 500, textTransform: "uppercase", 
                    letterSpacing: 0.8, textAlign: "left", marginBottom: 4,
                    background: view === v ? "var(--accent)" : "transparent",
                    color: view === v ? "#07080d" : "var(--textDim)",
                  }}
                >{v}</button>
              ))}
            </div>
          </div>
        )}

        {/* ── Main ── */}
        <main style={{ flex: 1, maxWidth: 780, width: "100%", margin: "0 auto", padding: "24px 16px" }}>

          {/* ═══════════════ DASHBOARD ═══════════════ */}
          {view === "dashboard" && (
            <div>
              <div className="fadeUp" style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(28px, 8vw, 40px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 8 }}>
                  Good {getGreeting()},<br />
                  <span style={{ color: "var(--accent)" }}>what's the plan?</span>
                </h1>
                <p style={{ color: "var(--textDim)", fontFamily: "var(--sans)", fontSize: "clamp(13px, 3vw, 15px)" }}>
                  {activeTasks.length} active task{activeTasks.length !== 1 ? "s" : ""} waiting for you.
                </p>
              </div>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
                <StatCard label="Completed Today" value={todayStats.completed} accent="var(--accent)" delay={1} />
                <StatCard label="Focus Sessions" value={todayStats.sessions} accent="#a78bfa" delay={2} />
                <StatCard label="Day Streak 🔥" value={streak} accent="var(--warn)" delay={3} />
                <StatCard label="Active Tasks" value={activeTasks.length} accent="#38bdf8" delay={4} />
              </div>

              {/* CTA */}
              <div className="fadeUp fadeUp-4" style={{
                background: "linear-gradient(135deg, #0d2e22 0%, #0e1820 100%)",
                border: "1px solid #1e3a2a", borderRadius: "var(--r-lg)",
                padding: "clamp(20px, 5vw, 28px) clamp(20px, 5vw, 32px)", marginBottom: 24, position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", right: -20, top: -20, width: 140, height: 140,
                  borderRadius: "50%", background: "rgba(110,231,183,0.06)", pointerEvents: "none",
                }} />
                <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--accent)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
                  Core Promise
                </div>
                <div style={{ fontFamily: "var(--serif)", fontSize: "clamp(16px, 4vw, 22px)", fontWeight: 700, marginBottom: 16, lineHeight: 1.3 }}>
                  "Open the app → Know what to do → Start immediately."
                </div>
                <button onClick={pickTask} style={{
                  background: "var(--accent)", color: "#07080d", border: "none", cursor: "pointer",
                  padding: "12px 24px", borderRadius: 10, fontFamily: "var(--mono)", fontSize: "clamp(11px, 2.5vw, 13px)",
                  fontWeight: 600, letterSpacing: 0.5, display: "inline-flex", alignItems: "center", gap: 8,
                  animation: "pulse-ring 2.5s ease-in-out infinite",
                }}>
                  ⚡ What should I work on?
                </button>
              </div>

              {/* Recent active tasks */}
              {activeTasks.length > 0 && (
                <div className="fadeUp fadeUp-5">
                  <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>
                    Active Tasks
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {activeTasks.slice(0, 5).map((t, i) => (
                      <TaskRow key={t.id} task={t} onComplete={completeTask} onDelete={deleteTask} onEdit={startEdit} onFocus={() => { setSelectedTask(t); setView("focus"); resetTimer(); }} />
                    ))}
                    {activeTasks.length > 5 && (
                      <button onClick={() => setView("tasks")} style={{ background: "none", border: "1px dashed var(--border)", color: "var(--textDim)", padding: "10px", borderRadius: "var(--r)", cursor: "pointer", fontFamily: "var(--mono)", fontSize: 12 }}>
                        +{activeTasks.length - 5} more tasks →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════ TASKS ═══════════════ */}
          {view === "tasks" && (
            <div>
              <div className="fadeUp" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
                <div>
                  <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(24px, 6vw, 32px)", fontWeight: 800 }}>Task List</h2>
                  <p style={{ color: "var(--textDim)", fontSize: "clamp(12px, 2.5vw, 13px)", marginTop: 4 }}>{activeTasks.length} active · {todayCompleted.length} done today</p>
                </div>
                <button onClick={() => { setAddOpen(true); setEditId(null); setForm({ title: "", dueDate: "", priority: "medium" }); }} style={{
                  background: "var(--accent)", color: "#07080d", border: "none", cursor: "pointer",
                  padding: "10px 20px", borderRadius: 10, fontFamily: "var(--mono)", fontSize: "clamp(11px, 2.5vw, 12px)", fontWeight: 600,
                }}>+ Add Task</button>
              </div>

              {/* Add/Edit form */}
              {addOpen && (
                <div className="fadeUp" style={{
                  background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)",
                  padding: 24, marginBottom: 24,
                }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--accent)", marginBottom: 16 }}>
                    {editId ? "Edit Task" : "New Task"}
                  </div>
                  <input
                    autoFocus placeholder="What needs to be done?" value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                    style={inputStyle}
                  />
                  <div style={{ display: "flex", gap: 12, marginTop: 12, flexDirection: "column" }}>
                    <input type="date" value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                      style={{ ...inputStyle }}
                    />
                    <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      style={{ ...inputStyle }}>
                      <option value="high">🔴 High</option>
                      <option value="medium">🟠 Medium</option>
                      <option value="low">🟢 Low</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                    <button onClick={addTask} style={{ ...btnPrimaryStyle, flex: "1 1 auto", minWidth: 120 }}>{editId ? "Save Changes" : "Add Task"}</button>
                    <button onClick={() => { setAddOpen(false); setEditId(null); }} style={{ ...btnGhostStyle, flex: "1 1 auto", minWidth: 100 }}>Cancel</button>
                  </div>
                </div>
              )}

              {/* Active tasks */}
              {activeTasks.length > 0 && (
                <div className="fadeUp fadeUp-1">
                  <SectionLabel>Active</SectionLabel>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                    {activeTasks.map((t) => (
                      <TaskRow key={t.id} task={t} onComplete={completeTask} onDelete={deleteTask} onEdit={startEdit} onFocus={() => { setSelectedTask(t); setView("focus"); resetTimer(); }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Completed */}
              {todayCompleted.length > 0 && (
                <div className="fadeUp fadeUp-2">
                  <SectionLabel>Completed Today</SectionLabel>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {todayCompleted.map((t) => (
                      <div key={t.id} style={{
                        background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r)",
                        padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, opacity: 0.5,
                        flexWrap: "wrap",
                      }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#10b98133", border: "1.5px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>✓</div>
                        <span style={{ fontSize: "clamp(13px, 3vw, 14px)", textDecoration: "line-through", color: "var(--textDim)", flex: "1 1 auto", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                        <div style={{ flexShrink: 0 }}>
                          <PriorityBadge p={t.priority} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tasks.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 14 }}>No tasks yet. Add one to get started!</div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════ FOCUS ═══════════════ */}
          {view === "focus" && (
            <div style={{ textAlign: "center" }}>
              <div className="fadeUp" style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(24px, 6vw, 32px)", fontWeight: 800 }}>Focus Session</h2>
                <p style={{ color: "var(--textDim)", fontSize: "clamp(12px, 2.5vw, 13px)", marginTop: 4 }}>25-minute deep work block</p>
              </div>

              {/* Timer ring */}
              <div className="fadeUp fadeUp-1" style={{ display: "inline-block", position: "relative", marginBottom: 24 }}>
                <svg width={260} height={260} viewBox="0 0 260 260" style={{ transform: "rotate(-90deg)", maxWidth: "260px", width: "100%", height: "auto" }} className="timer-svg">
                  <circle cx={130} cy={130} r={110} fill="none" stroke="var(--border)" strokeWidth={8} />
                  <circle cx={130} cy={130} r={110} fill="none"
                    stroke={timerDone ? "var(--accent)" : timerRunning ? "var(--accent)" : "var(--muted)"}
                    strokeWidth={8} strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - progress)}
                    style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.3s ease" }}
                  />
                </svg>
                <div style={{
                  position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{
                    fontFamily: "var(--mono)", fontSize: "clamp(36px, 10vw, 52px)", fontWeight: 600,
                    color: timerDone ? "var(--accent)" : "var(--text)",
                    animation: timerRunning && timerSec <= 60 ? "timerPulse 1s ease infinite" : "none",
                    letterSpacing: -2,
                  }}>{fmt(timerSec)}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: "clamp(9px, 2vw, 11px)", color: "var(--muted)", letterSpacing: 1, marginTop: 4 }}>
                    {timerDone ? "DONE!" : timerRunning ? "FOCUSING" : "READY"}
                  </div>
                </div>
              </div>

              {/* Current task */}
              {selectedTask ? (
                <div className="fadeUp fadeUp-2" style={{
                  background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)",
                  padding: "clamp(16px, 4vw, 20px) clamp(18px, 4vw, 24px)", marginBottom: 24, textAlign: "left",
                }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: "clamp(9px, 2vw, 10px)", color: "var(--accent)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
                    Working on
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexDirection: "column" }}>
                    <div style={{ flex: 1, width: "100%" }}>
                      <div style={{ fontSize: "clamp(16px, 3.5vw, 18px)", fontWeight: 600, marginBottom: 6 }}>{selectedTask.title}</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <PriorityBadge p={selectedTask.priority} />
                        {selectedTask.dueDate && (
                          <span style={{ fontFamily: "var(--mono)", fontSize: "clamp(9px, 2vw, 11px)", color: isOverdue(selectedTask) ? "var(--danger)" : "var(--textDim)" }}>
                            {isOverdue(selectedTask) ? "⚠ " : "📅 "}Due {selectedTask.dueDate}
                          </span>
                        )}
                        {(selectedTask.focusSessionsCount || 0) > 0 && (
                          <span style={{ fontFamily: "var(--mono)", fontSize: "clamp(9px, 2vw, 11px)", color: "var(--muted)" }}>
                            🍅 ×{selectedTask.focusSessionsCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => completeTask(selectedTask.id)} style={{
                      background: "var(--accent)", color: "#07080d", border: "none", cursor: "pointer",
                      padding: "10px 20px", borderRadius: 8, fontFamily: "var(--mono)", fontSize: "clamp(11px, 2.5vw, 12px)", 
                      fontWeight: 600, width: "100%",
                    }}>
                      ✓ Mark Complete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="fadeUp fadeUp-2" style={{
                  background: "var(--card)", border: "1px dashed var(--border)", borderRadius: "var(--r-lg)",
                  padding: "clamp(20px, 5vw, 24px)", marginBottom: 24, color: "var(--muted)",
                }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: "clamp(12px, 2.5vw, 13px)" }}>No task selected.</div>
                  <button onClick={pickTask} style={{ ...btnPrimaryStyle, marginTop: 16, display: "inline-block", fontSize: "clamp(11px, 2.5vw, 13px)" }}>
                    ⚡ Pick my next task
                  </button>
                </div>
              )}

              {/* Timer controls */}
              <div className="fadeUp fadeUp-3" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                {!timerDone ? (
                  <>
                    <button onClick={() => setTimerRunning((r) => !r)} style={{
                      ...btnPrimaryStyle, padding: "14px 32px", fontSize: "clamp(13px, 3vw, 15px)", minWidth: 140, flex: "1 1 auto", maxWidth: 200,
                    }}>
                      {timerRunning ? "⏸ Pause" : "▶ Start"}
                    </button>
                    <button onClick={resetTimer} style={{ ...btnGhostStyle, flex: "0 1 auto" }}>↺ Reset</button>
                  </>
                ) : (
                  <>
                    <button onClick={resetTimer} style={{ ...btnPrimaryStyle, flex: "1 1 auto", maxWidth: 200 }}>Start Another</button>
                    {selectedTask && (
                      <button onClick={() => completeTask(selectedTask.id)} style={{ ...btnGhostStyle, borderColor: "var(--accent)", color: "var(--accent)", flex: "1 1 auto", maxWidth: 200 }}>
                        ✓ Mark Complete
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Pick different task */}
              {selectedTask && !timerRunning && (
                <div style={{ marginTop: 20 }}>
                  <button onClick={pickTask} style={{ background: "none", border: "none", color: "var(--textDim)", cursor: "pointer", fontFamily: "var(--mono)", fontSize: 12, textDecoration: "underline" }}>
                    Pick a different task →
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* ── Toast ── */}
        {toast && (
          <div style={{
            position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
            background: toast.type === "warn" ? "#1c1800" : "#0d2318",
            border: `1px solid ${toast.type === "warn" ? "var(--warn)" : "var(--accent)"}`,
            color: toast.type === "warn" ? "var(--warn)" : "var(--accent)",
            padding: "12px 24px", borderRadius: 100, fontFamily: "var(--mono)", fontSize: "clamp(11px, 2.5vw, 13px)",
            zIndex: 999, animation: "fadeUp 0.3s ease",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            maxWidth: "calc(100vw - 40px)", textAlign: "center",
          }}>
            {toast.msg}
          </div>
        )}
      </div>
    </>
  );
}

// ── Task Row ──────────────────────────────────────────────────────────────────
function TaskRow({ task, onComplete, onDelete, onEdit, onFocus }) {
  const [hover, setHover] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const overdue = isOverdue(task);

  return (
    <div 
      onMouseEnter={() => setHover(true)} 
      onMouseLeave={() => setHover(false)}
      onClick={() => setShowActions(!showActions)}
      style={{
        background: hover ? "#15172200" : "var(--card)",
        border: `1px solid ${overdue ? "#f8717133" : hover ? "#2a2d3e" : "var(--border)"}`,
        borderRadius: "var(--r)", padding: "14px 18px",
        display: "flex", alignItems: "center", gap: 14, transition: "all 0.15s",
        background: overdue ? "#1a0e0e" : hover ? "#151722" : "var(--card)",
        cursor: "pointer",
      }}>
      <button onClick={(e) => { e.stopPropagation(); onComplete(task.id); }} style={{
        width: 22, height: 22, borderRadius: "50%", border: "1.5px solid var(--muted)",
        background: "transparent", cursor: "pointer", flexShrink: 0, display: "flex",
        alignItems: "center", justifyContent: "center", fontSize: 11, color: "var(--accent)",
        transition: "all 0.15s",
      }} title="Mark complete">
        {(hover || showActions) ? "✓" : ""}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "clamp(13px, 3vw, 14px)", fontWeight: 500, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {task.title}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <PriorityBadge p={task.priority} />
          {task.dueDate && (
            <span style={{ fontFamily: "var(--mono)", fontSize: "clamp(9px, 2vw, 10px)", color: overdue ? "var(--danger)" : "var(--muted)" }}>
              {overdue ? "⚠ OVERDUE · " : "📅 "}{task.dueDate}
            </span>
          )}
          {(task.focusSessionsCount || 0) > 0 && (
            <span style={{ fontFamily: "var(--mono)", fontSize: "clamp(9px, 2vw, 10px)", color: "var(--muted)" }}>
              🍅 ×{task.focusSessionsCount}
            </span>
          )}
        </div>
      </div>
      {(hover || showActions) && (
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <IconBtn title="Focus" onClick={(e) => { e.stopPropagation(); onFocus(); }}>▶</IconBtn>
          <IconBtn title="Edit" onClick={(e) => { e.stopPropagation(); onEdit(task); }}>✎</IconBtn>
          <IconBtn title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} danger>✕</IconBtn>
        </div>
      )}
    </div>
  );
}

function IconBtn({ onClick, title, danger, children }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 32, height: 32, borderRadius: 6, border: `1px solid ${danger ? "#f8717155" : "var(--border)"}`,
      background: "transparent", color: danger ? "var(--danger)" : "var(--textDim)", cursor: "pointer",
      fontFamily: "var(--mono)", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center",
      minWidth: 32, minHeight: 32,
    }}>{children}</button>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontFamily: "var(--mono)", fontSize: "clamp(9px, 2vw, 10px)", letterSpacing: 2, textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>
      {children}
    </div>
  );
}

// ── Streak calc ───────────────────────────────────────────────────────────────
function calcStreak(stats) {
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (stats[key]?.completed > 0) { streak++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputStyle = {
  width: "100%", background: "#0a0b12", border: "1px solid var(--border)",
  borderRadius: "var(--r)", padding: "12px 16px", color: "var(--text)",
  fontFamily: "var(--sans)", fontSize: "clamp(13px, 3vw, 14px)", outline: "none",
};

const btnPrimaryStyle = {
  background: "var(--accent)", color: "#07080d", border: "none", cursor: "pointer",
  padding: "11px 24px", borderRadius: 10, fontFamily: "var(--mono)", fontSize: "clamp(12px, 2.5vw, 13px)", fontWeight: 600,
};

const btnGhostStyle = {
  background: "transparent", color: "var(--textDim)", border: "1px solid var(--border)", cursor: "pointer",
  padding: "11px 24px", borderRadius: 10, fontFamily: "var(--mono)", fontSize: "clamp(12px, 2.5vw, 13px)",
};

const btnAccentSmall = {
  background: "var(--accent)", color: "#07080d", border: "none", cursor: "pointer",
  padding: "8px 16px", borderRadius: 8, fontFamily: "var(--mono)", fontSize: "clamp(11px, 2.5vw, 12px)", fontWeight: 600, flexShrink: 0,
};