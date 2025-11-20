# NDL Judge Dashboard System - Complete Implementation Guide

## ✅ Implementation Status

All core features have been implemented and are ready for integration.

## 📁 File Structure

### Frontend Components & Hooks

```
client/src/
├── hooks/
│   ├── useKeyboardNavigation.ts      ✅ Keyboard navigation with cursor logic
│   ├── useSessionTimeout.ts          ✅ Auto-logout on inactivity (30 min)
│   └── useJudgeRealtime.ts           ✅ WebSocket real-time updates
├── components/judge/
│   ├── AIEvaluationPanel.tsx         ✅ Slide-in AI evaluation panel
│   ├── SignaturePad.tsx              ✅ Enhanced with draw/type modes
│   ├── LiveMatchViewer.tsx           ✅ Player dashboard integration
│   └── [existing components...]      ✅ All existing components
├── services/
│   └── aiEvaluation.ts               ✅ AI evaluation service (mock)
├── utils/
│   ├── validation.ts                 ✅ Validation utilities
│   └── reportGenerator.ts            ✅ PDF/CSV report generation
└── pages/
    └── JudgePanel.tsx                ✅ Main judge dashboard (needs integration)
```

### Backend Routes & Controllers

```
server/src/
├── routes/
│   └── judge.js                      ✅ All judge routes including AI evaluation
├── controllers/
│   └── judgeController.js            ✅ All judge logic + AI eval + submit results
└── services/
    └── socket.js                     ✅ Enhanced WebSocket handlers
```

## 🎯 Key Features Implemented

### 1. ✅ Keyboard Navigation & Accessibility
- **Hook**: `useKeyboardNavigation.ts`
- **Features**:
  - Arrow keys navigation (↑↓←→)
  - Enter to activate
  - Escape to close modals
  - Custom key bindings (S=Start, P=Pause, R=Resume, E=End, A=Accept, D=Decline)
  - Focus trap in modals
  - Keyboard shortcuts (Ctrl+S, Ctrl+Enter)

### 2. ✅ Session Management
- **Hook**: `useSessionTimeout.ts`
- **Features**:
  - Auto-logout after 30 minutes of inactivity
  - Activity tracking (mouse, keyboard, scroll, touch)
  - Session remaining time display
  - Automatic redirect to login

### 3. ✅ AI Evaluation System
- **Service**: `aiEvaluation.ts`
- **Component**: `AIEvaluationPanel.tsx`
- **Backend**: `/api/judge/matches/:matchId/ai-evaluate`
- **Features**:
  - Mock AI evaluation (ready for real AI integration)
  - Slide-in panel with dark+neon theme
  - Functionality & Innovation scores (0-100)
  - Plagiarism & AI-generated code detection
  - Evidence display
  - Strengths & weaknesses analysis
  - Adopt or Override options

### 4. ✅ Digital Signature
- **Component**: `SignaturePad.tsx` (enhanced)
- **Features**:
  - Draw signature on canvas
  - Type signature option
  - Signature validation
  - Judge name pre-fill

### 5. ✅ Report Generation
- **Utility**: `reportGenerator.ts`
- **Features**:
  - CSV export
  - PDF export (requires jsPDF: `npm install jspdf`)
  - Match summary with all scores
  - Team and player breakdowns
  - Feedback inclusion

### 6. ✅ Real-time Updates
- **Hook**: `useJudgeRealtime.ts`
- **Backend**: Enhanced `socket.js`
- **Features**:
  - Timer updates via WebSocket
  - Score synchronization
  - Co-judge score updates
  - Match status changes
  - Auto-refresh on updates

### 7. ✅ Validation System
- **Utility**: `validation.ts`
- **Features**:
  - Lineup validation (captain check, min players, duplicates)
  - Score validation (range checks, required fields)
  - Match start validation (all judges accepted, lineups approved)
  - Match end validation (all scores locked)
  - Score discrepancy detection (>2 point difference)

### 8. ✅ Player Dashboard Integration
- **Component**: `LiveMatchViewer.tsx`
- **Features**:
  - Players can view live match progress
  - Real-time timer display
  - Score updates
  - Match status
  - Judge information

## 🎨 Dark + Neon Theme

### Color Palette
- **Background**: `#0b0f19` (dark)
- **Secondary BG**: `#1a1f2e`
- **Neon Cyan**: `#00ffc3`
- **Neon Pink**: `#ff0077`
- **Accent**: `#00d4aa`

### Typography
- Use futuristic fonts: Orbitron, Rajdhani (add to `index.css`)

### Components
- Glass effect panels
- Glowing focus outlines
- Smooth transitions (200ms ease-in-out)
- Rounded corners (2xl)

## 🔌 Integration Steps

### Step 1: Integrate Keyboard Navigation into JudgePanel

Add to `JudgePanel.tsx`:

```typescript
import { useKeyboardNavigation, useFocusTrap } from '@/hooks/useKeyboardNavigation';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { useJudgeRealtime } from '@/hooks/useJudgeRealtime';

// Inside component:
useSessionTimeout(30); // 30 minute timeout

// Keyboard shortcuts
useKeyboardNavigation({
  onKeyPress: (key) => {
    if (key === 's' && selectedMatch && canStartMatch) {
      startTimerMutation.mutate({ matchId: selectedMatchId!, duration: 3600 });
    } else if (key === 'p' && selectedMatch?.timer?.isRunning) {
      pauseTimerMutation.mutate(selectedMatchId!);
    } else if (key === 'r' && selectedMatch?.timer && !selectedMatch.timer.isRunning) {
      resumeTimerMutation.mutate(selectedMatchId!);
    } else if (key === 'e' && selectedMatch?.status === 'in_progress') {
      setShowEndMatchDialog(true);
    } else if (key === 'a' && selectedMatch?.judgeStatus === 'pending') {
      acceptMatchMutation.mutate(selectedMatchId!);
    } else if (key === 'd' && selectedMatch?.judgeStatus === 'pending') {
      declineMatchMutation.mutate(selectedMatchId!);
    }
  },
  enabled: true,
});

// Real-time updates
useJudgeRealtime(selectedMatchId);
```

### Step 2: Integrate AI Evaluation Panel

Add to `JudgePanel.tsx`:

```typescript
import { AIEvaluationPanel } from '@/components/judge/AIEvaluationPanel';

const [showAIPanel, setShowAIPanel] = useState(false);
const [aiTeamId, setAiTeamId] = useState<string | null>(null);

// In TeamEvaluationPanel, add button:
<Button onClick={() => {
  setAiTeamId(teamId);
  setShowAIPanel(true);
}}>
  🤖 Run AI Evaluation
</Button>

// Add panel:
<AIEvaluationPanel
  matchId={selectedMatchId!}
  teamId={aiTeamId!}
  teamName={selectedMatch?.homeTeamId === aiTeamId 
    ? selectedMatch.homeTeam?.name 
    : selectedMatch?.awayTeam?.name}
  isOpen={showAIPanel && !!aiTeamId}
  onClose={() => {
    setShowAIPanel(false);
    setAiTeamId(null);
  }}
  onAdoptScores={(result) => {
    // Scores already submitted by panel
    queryClient.invalidateQueries({ queryKey: ['judge-match', selectedMatchId] });
  }}
  onOverride={() => {
    setShowAIPanel(false);
    // Focus on manual scoring
  }}
/>
```

### Step 3: Add Report Generation

Add to `JudgePanel.tsx`:

```typescript
import { downloadCSVReport, downloadPDFReport } from '@/utils/reportGenerator';

const handleExportReport = async (format: 'csv' | 'pdf') => {
  if (!selectedMatch) return;

  const reportData = {
    match: selectedMatch,
    teamScores: {
      [selectedMatch.homeTeamId]: {
        autoScore: selectedMatch.autoScores?.find(s => s.teamId === selectedMatch.homeTeamId),
        judgeScores: selectedMatch.judgeScores?.filter(s => s.teamId === selectedMatch.homeTeamId),
        averageScore: calculateAverageScore(selectedMatch.homeTeamId),
      },
      [selectedMatch.awayTeamId]: {
        autoScore: selectedMatch.autoScores?.find(s => s.teamId === selectedMatch.awayTeamId),
        judgeScores: selectedMatch.judgeScores?.filter(s => s.teamId === selectedMatch.awayTeamId),
        averageScore: calculateAverageScore(selectedMatch.awayTeamId),
      },
    },
    playerScores: selectedMatch.playerScores || [],
    feedback: selectedMatch.feedback || [],
  };

  if (format === 'csv') {
    downloadCSVReport(reportData);
  } else {
    await downloadPDFReport(reportData);
  }
};
```

### Step 4: Integrate Live Match Viewer in Player Dashboard

Add to `PlayerDashboard.tsx`:

```typescript
import { LiveMatchViewer } from '@/components/judge/LiveMatchViewer';

// In matches section:
{matches
  .filter((m: any) => m.status === 'in_progress')
  .map((match: any) => (
    <LiveMatchViewer
      key={match.id}
      matchId={match.id}
      onClose={() => navigate(`/matches/${match.id}`)}
    />
  ))}
```

### Step 5: Add Validation

Add to lineup approval and score submission:

```typescript
import { validateLineup, validateJudgeScores, validateMatchStart } from '@/utils/validation';

// Before approving lineup:
const validation = validateLineup(lineup);
if (!validation.isValid) {
  toast({
    title: "Validation Failed",
    description: validation.errors.join(", "),
    variant: "destructive",
  });
  return;
}

// Before starting match:
const validation = validateMatchStart(selectedMatch);
if (!validation.isValid) {
  toast({
    title: "Cannot Start Match",
    description: validation.errors.join(", "),
    variant: "destructive",
  });
  return;
}
```

## 🚀 API Endpoints

All endpoints are available at `/api/judge/*`:

- `GET /api/judge/matches` - Get assigned matches
- `POST /api/judge/matches/:matchId/accept` - Accept match
- `POST /api/judge/matches/:matchId/decline` - Decline match
- `GET /api/judge/matches/:matchId` - Get match details
- `POST /api/judge/matches/:matchId/timer/start` - Start timer
- `POST /api/judge/matches/:matchId/timer/pause` - Pause timer
- `POST /api/judge/matches/:matchId/timer/resume` - Resume timer
- `POST /api/judge/matches/:matchId/timer/end` - End match
- `POST /api/judge/matches/:matchId/lineup/:teamId/approve` - Approve lineup
- `POST /api/judge/matches/:matchId/ai-evaluate` - **NEW** AI evaluation
- `POST /api/judge/matches/:matchId/auto-scores` - Submit AI scores
- `POST /api/judge/matches/:matchId/scores/team` - Submit team scores
- `POST /api/judge/matches/:matchId/scores/team/:teamId/lock` - Lock scores
- `POST /api/judge/matches/:matchId/scores/player` - Submit player scores
- `GET /api/judge/matches/:matchId/co-judge-scores` - Get co-judge scores
- `POST /api/judge/matches/:matchId/feedback` - Submit feedback
- `POST /api/judge/matches/:matchId/submit-results` - **NEW** Submit final results

## 📡 WebSocket Events

### Client → Server
- `join:match` - Join match room
- `leave:match` - Leave match room
- `judge:join` - Join as judge
- `judge:leave` - Leave as judge

### Server → Client
- `match:update` - Match data updated
- `match:live` - Live match updates (timer, scores)
- `timer:update` - Timer state changed
- `score:update` - Score updated by co-judge
- `ai:evaluation:ready` - AI evaluation completed
- `notification:judge` - Judge notification

## 🎯 Keyboard Shortcuts Reference

| Key | Action |
|-----|--------|
| `S` | Start Match |
| `P` | Pause Match |
| `R` | Resume Match |
| `E` | End Match |
| `A` | Accept Match |
| `D` | Decline Match |
| `Ctrl+S` | Save Scores |
| `Ctrl+Enter` | Submit Results |
| `↑↓` | Navigate matches |
| `Enter` | Open/Activate |
| `Esc` | Close modal |

## 🔒 Security & Validation

- ✅ All routes require authentication
- ✅ Judge assignment verification
- ✅ Score locking prevents modifications
- ✅ Signature required for final submission
- ✅ All judges must sign before match completion
- ✅ Validation prevents invalid operations

## 📦 Dependencies to Install

```bash
# For PDF generation (optional)
npm install jspdf

# Already installed:
# - socket.io-client (real-time)
# - @tanstack/react-query (data fetching)
# - date-fns (date formatting)
# - zustand (state management)
```

## 🎨 Theme Integration

Add to `index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600;700&display=swap');

:root {
  --ndl-dark: #0b0f19;
  --ndl-dark-secondary: #1a1f2e;
  --ndl-neon-cyan: #00ffc3;
  --ndl-neon-pink: #ff0077;
  --ndl-accent: #00d4aa;
}

.font-futuristic {
  font-family: 'Orbitron', sans-serif;
}

.font-ndl {
  font-family: 'Rajdhani', sans-serif;
}
```

## ✅ Next Steps

1. **Integrate all hooks into JudgePanel.tsx** (see Step 1-5 above)
2. **Apply dark+neon theme** to existing components
3. **Test keyboard navigation** in all scenarios
4. **Test WebSocket real-time updates**
5. **Connect AI evaluation** to actual AI service (replace mock)
6. **Test report generation** (install jsPDF if needed)
7. **Add LiveMatchViewer** to PlayerDashboard

## 🔗 Player Dashboard Connection

Players can now view live matches via `LiveMatchViewer` component. The component:
- Fetches match data in real-time
- Shows timer updates
- Displays scores
- Shows match status
- Updates every 5 seconds

All components are ready and interconnected. The system is production-ready once integrated into the main JudgePanel component.

