# NDL Judging System - Implementation Locations

## 📁 File Structure

### Frontend Components (React/TypeScript)
**Location:** `client/src/components/judge/`

1. **MatchTimer.tsx** - Match timer with halftime support (45/60 mins configurable)
2. **TeamEvaluationPanel.tsx** - Team scoring with weighted criteria & conflict detection
3. **PlayerEvaluationPanel.tsx** - Individual player evaluation
4. **AutoJudgePanel.tsx** - AI-assisted scoring display
5. **MatchList.tsx** - List of assigned matches with actions
6. **LineupApproval.tsx** - Pre-match lineup review & approval
7. **EndMatchConfirmation.tsx** - Dual-judge confirmation for match end
8. **ReportModal.tsx** - Final match report review
9. **SignaturePad.tsx** - Digital signature capture
10. **JudgeChat.tsx** - Real-time co-judge collaboration
11. **ScoreSlider.tsx** - Interactive scoring slider component
12. **SystemClock.tsx** - League time display
13. **NotificationPanel.tsx** - Notifications display

### Frontend Main Page
**Location:** `client/src/pages/JudgePanel.tsx` (919 lines)
- Complete judge dashboard with all sections
- Overview, Match Management, Live Control, Evaluation, Post-Match
- All API integrations using React Query
- State management with Zustand

### Frontend API Client
**Location:** `client/src/api/judge.js`
- All judge API endpoint wrappers
- Functions: getAssignedMatches, acceptMatch, declineMatch, etc.

### Frontend Store
**Location:** `client/src/store/useJudgeStore.ts`
- Zustand store for judge state management

---

### Backend Controller
**Location:** `server/src/controllers/judgeController.js`
- All judge business logic
- Functions:
  - `getAssignedMatches` - Fetch matches with auto-assignment
  - `acceptMatch` / `declineMatch` - Match assignment actions
  - `getMatchForJudging` - Detailed match data
  - `startMatchTimer` / `pauseMatchTimer` / `resumeMatchTimer` / `endMatch` - Timer controls
  - `submitLineup` / `approveLineup` - Lineup management
  - `submitAutoScores` - Auto-judge scores
  - `submitJudgeScores` / `lockJudgeScores` - Team scoring
  - `submitPlayerScores` - Individual player scoring
  - `submitFeedback` - Feedback submission
  - `getCoJudgeScores` - Co-judge collaboration

### Backend Routes
**Location:** `server/src/routes/judge.js`
- API route definitions for `/api/judge/*`

### Backend Integration
**Location:** `server/src/index.js`
- Judge routes registered: `app.use('/api/judge', judgeRoutes)`

---

### Database Schema
**Location:** `server/prisma/schema.prisma`

**New Models:**
- `MatchJudge` - Judge assignments to matches
- `Lineup` - Team lineups for matches
- `AutoScore` - AI-generated scores
- `JudgeScore` - Human judge team scores
- `PlayerScore` - Individual player scores
- `MatchFeedback` - Feedback entries
- `MatchTimer` - Match timer state with halftime tracking

**New Enums:**
- `JudgeStatus` (pending, accepted, declined)
- `LineupStatus` (pending, submitted, approved)

---

## 🔍 Debugging

### Added Console Logging:
- **Backend:** Logs in `judgeController.js` show:
  - When fetching matches
  - When auto-assigning matches
  - Match count returned
  
- **Frontend:** Logs in `JudgePanel.tsx` show:
  - API call initiation
  - Response data received
  - Current state (matches, loading, errors)

### How to Debug:
1. Open browser console (F12)
2. Navigate to `/judge` page
3. Check console for:
   - `🔍 [Frontend] Fetching assigned matches...`
   - `✅ [Frontend] Received matches: [...]`
   - `📊 [Frontend] Assigned matches state: {...}`
4. Check backend terminal for:
   - `🔍 [Judge API] Fetching matches for judge: ...`
   - `📝 [Judge API] No assigned matches found, auto-assigning...`
   - `✅ [Judge API] Auto-assigned X matches...`
   - `📊 [Judge API] Returning X matches with status`

---

## ✅ Features Implemented

### 1. Match Management
- ✅ View assigned matches
- ✅ Accept/Decline match assignments
- ✅ Auto-assignment for testing
- ✅ Match status tracking

### 2. Live Match Control
- ✅ Match timer (Start/Pause/Resume/End)
- ✅ Configurable halves (45/60 mins)
- ✅ Halftime status tracking
- ✅ Timer state persistence

### 3. Team Evaluation
- ✅ Weighted criteria scoring (Code Functionality, Innovation, Presentation, etc.)
- ✅ Auto-judge integration panel
- ✅ Co-judge score comparison
- ✅ Conflict detection
- ✅ Score locking mechanism

### 4. Individual Evaluation
- ✅ Per-player scoring
- ✅ Role-based evaluation
- ✅ Player tabs navigation

### 5. Auto-Judge Integration
- ✅ Auto-score display
- ✅ Plagiarism detection flags
- ✅ AI suggestions panel

### 6. Co-Judge Collaboration
- ✅ Real-time chat component
- ✅ Score comparison view
- ✅ Co-judge visibility

### 7. Post-Match Actions
- ✅ End match confirmation (dual-judge requirement)
- ✅ Report review modal
- ✅ Digital signature pad
- ✅ Feedback submission (public/private)

### 8. Lineup Management
- ✅ Lineup submission
- ✅ Lineup approval interface
- ✅ Player role assignment

---

## 🚀 Next Steps to See Changes

1. **Hard refresh browser** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Check browser console** for API logs
3. **Check backend terminal** for server logs
4. **Verify database** has matches (run seed if needed: `npm run prisma:seed`)

---

## 📝 Notes

- All components are fully implemented and integrated
- API endpoints are functional
- Database schema is up to date
- Debug logging added for troubleshooting
- Error handling in place

If matches are not showing:
1. Check browser console for errors
2. Check backend terminal for API logs
3. Verify user is logged in as a judge
4. Check database has matches assigned to judges

