# Judge Dashboard Access Guide

## 🔐 Judge Credentials

**Judge 1:**
- Email: `juliana.bakhtsizina@ndl.rw`
- Password: `password123`
- Name: Juliana Bakhtsizina

**Judge 2:**
- Email: `andre.vacha@ndl.rw`
- Password: `password123`
- Name: Andre Vacha

## 🌐 Access Steps

1. **Open Browser:** Go to `http://localhost:8080`
2. **Login:** Click "Login" or go to `/auth`
3. **Enter Credentials:** Use one of the judge emails above
4. **Navigate:** After login, go to `/judge` or click "Dashboard" → "Judge Dashboard"

## 📋 What You Should See

### Overview Section (Default)
- **Top Bar:** Judge name, avatar, system clock, notifications
- **Left Sidebar:** Navigation menu (Overview, Match Management, History, Reports)
- **Stats Cards:** 4 cards showing:
  - Pending Assignments (blue)
  - Accepted Matches (green)
  - In Progress (yellow)
  - Completed (black)
- **Assigned Matches Panel:** List of all matches assigned to you

### Match Management Section
- **Match List:** All assigned matches with status
- **Match Details:** When you click a match:
  - Match timer controls
  - Team evaluation panels
  - Player evaluation tabs
  - Auto-judge results
  - Co-judge collaboration
  - Lineup approval
  - Feedback submission

### All Features Implemented:
✅ Match Management with lineup approval
✅ Live Match Control with timer
✅ Team Evaluation with weighted criteria
✅ Individual Evaluation
✅ AutoJudge integration panel
✅ Co-judge collaboration (chat)
✅ Post-Match actions (ReportModal + SignaturePad)
✅ Digital signature for submission

## 🔍 Troubleshooting

### If you see "No matches assigned":
1. Check browser console (F12) for API errors
2. Verify backend is running on port 3001
3. Check server console for route registration messages:
   - `✅ [Judge Routes] Routes registered: /api/judge/*`
   - `✅ [Server] Judge routes mounted at /api/judge`
4. The API auto-assigns all matches if none are assigned

### If you see 404 errors:
1. Restart the backend server
2. Check that `server/src/routes/judge.js` exists
3. Verify `server/src/index.js` has: `app.use('/api/judge', judgeRoutes);`

### If dashboard is blank:
1. Hard refresh browser (Ctrl+Shift+R)
2. Check browser console for React errors
3. Verify you're logged in as a judge (check user role)

## 📁 File Locations

All components are in:
- `client/src/pages/JudgePanel.tsx` - Main dashboard
- `client/src/components/judge/` - All judge components
- `server/src/controllers/judgeController.js` - Backend API
- `server/src/routes/judge.js` - API routes


