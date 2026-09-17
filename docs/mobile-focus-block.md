# 📱 FocusFlow Mobile — App Blocking (Modo Foco)

## Objetivo

Bloquear aplicações distractivas no **Android** enquanto o modo de foco está ativo.
(iOS fica para uma fase futura — requer Screen Time / entitlement da Apple.)

## Arquitetura

```
App Mobile (Expo SDK 57)
  │
  ├─ TimerScreen ──► POST /api/v1/sessions (início/fim)
  │       │
  │       └─ FocusBlock.startBlocking([packages])  ──►  react-native-focus-block
  │                                                            │
  BlocklistScreen ──► FocusBlock.getInstalledApps()            ├─ FocusBlockAccessibilityService
  (gestão da lista em AsyncStorage)                            │     ├─ deteta foreground app
                                                               │     └─ mostra BlockOverlayView
                                                               └─ (desbloqueio manual 30s, máx 2/sessão)
```

## Componentes

| Componente | Ficheiro | Papel |
|---|---|---|
| **Módulo nativo** | `apps/mobile/modules/focus-block/android/` | AccessibilityService + overlay + bridge RN |
| `FocusBlockModule.java` | Bridge | `startBlocking`, `stopBlocking`, `getInstalledApps`, `isAccessibilityServiceEnabled`, `openAccessibilitySettings`, `getBlockState` |
| `FocusBlockAccessibilityService.java` | Android Service | Deteta `TYPE_WINDOW_STATE_CHANGED`; bloqueia se package ∈ blocklist |
| `BlockOverlayView.java` | Overlay | Ecrã inteiro (`TYPE_APPLICATION_OVERLAY`), botão de desbloqueio temporário |
| Config plugin | `apps/mobile/plugins/with-focusblock.js` | Garante package `com.focusflow.app` + permissão `SYSTEM_ALERT_WINDOW` |
| Ecrã Timer | `apps/mobile/src/screens/TimerScreen.tsx` | Timer 25/50/90 + Custom (paridade web), alarme (`expo-audio`), inicia/para bloqueio, desbloqueios restantes |
| Ecrã Blocklist | `apps/mobile/src/screens/BlocklistScreen.tsx` | Lista apps instaladas + switches (modal, a partir da aba Focus) |

## Regras do desbloqueio manual

- Ao abrir uma app bloqueada durante o foco, o overlay cobre o ecrã.
- Botão **"Desbloquear temporariamente (30s)"** dá uma janela de tolerância.
- Limite de **2 desbloqueios por sessão**. Esgotado, o overlay não oferece botão.

## Como correr (Android)

Requisitos: JDK 17+, Android Studio / SDK, dispositivo ou emulador.

```bash
cd apps/api
npx prisma migrate dev   # (se ainda não tiveres a DB)

# backends (na raiz)
npm run dev              # API :4000 + Web :3000

# mobile
cd apps/mobile
npx expo run:android     # gera o dev build (prebuild + gradle)
```

> Nota: os ficheiros `android/` são ignorados pelo git e regenerados por
> `expo prebuild` (automático no `expo run:android`), a partir do `app.json` +
> configura plugins + manifest do módulo. O alarme `assets/beep.wav` é gerado por
> `node scripts/generate-beep.js`.

## Permissões utilizadas

- `BIND_ACCESSIBILITY_SERVICE` — serviço de acessibilidade (necessário p/ detectar foreground app)
- `SYSTEM_ALERT_WINDOW` — overlay de bloqueio em ecrã inteiro
- `<queries>` MAIN/LAUNCHER — listar apps instaladas **sem** `QUERY_ALL_PACKAGES`

## Limitações conhecidas

- O serviço de acessibilidade tem de estar **ativo** nas definições Android.
- O utilizador pode desativar o serviço (por design do Android — não é contornável).
- O timer corre apenas enquanto a app está aberta; o bloqueio continua porque o
  serviço de acessibilidade corre a nível do sistema.

## iOS (futuro)

Bloqueio real de apps por terceiros no iOS exige o framework **Screen Time**
(`FamilyControls`) com entitlement aprovado pela Apple — fora do âmbito atual.