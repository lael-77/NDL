# Verify Data Display

## ✅ Backend Status
- Server is running on `http://localhost:3001`
- API is returning **104 teams** with data
- Database is seeded with:
  - 20 schools
  - 100 teams (plus 4 National tier teams = 104 total)
  - 400 students
  - 20 coaches
  - 200 matches

## 🔍 Troubleshooting Steps

### 1. Check Browser Console
Open browser DevTools (F12) and check:
- **Console tab**: Look for any errors
- **Network tab**: Check if API calls to `/api/leaderboard` and `/api/teams` are successful
  - Status should be `200 OK`
  - Response should contain team data

### 2. Verify API Endpoints
Test these URLs directly in browser:
- `http://localhost:3001/api/leaderboard` - Should return JSON array of teams
- `http://localhost:3001/api/teams` - Should return JSON array of teams
- `http://localhost:3001/api/matches` - Should return JSON array of matches

### 3. Clear Browser Cache
If data isn't showing:
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
4. Or use Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

### 4. Check React Query Cache
In browser console, run:
```javascript
// Check if data is cached
console.log('React Query Cache:', window.__REACT_QUERY_STATE__);
```

### 5. Force Refresh Data
The app now includes:
- Automatic retry (3 attempts)
- Refetch on window focus
- Debug logging in console
- Loading states
- Error handling with retry buttons

### 6. Verify CORS
Check browser console for CORS errors. The server is configured to allow:
- Origin: `http://localhost:8080`
- Credentials: true

## 📊 Expected Data Structure

Each team object should have:
```json
{
  "id": "uuid",
  "name": "School Name Tier",
  "tier": "beginner|amateur|regular|professional|legendary|national",
  "points": 0-600,
  "wins": 0-20,
  "draws": 0-5,
  "losses": 0-10,
  "school": {
    "name": "School Name",
    "tier": "beginner|amateur|regular|professional|legendary",
    "location": "City Name",
    "motto": "School Motto",
    "sponsor": "Sponsor Name or null"
  },
  "captain": {
    "fullName": "Student Name",
    "email": "email@example.com"
  }
}
```

## 🐛 Common Issues

1. **Empty leaderboard**: Check if API is returning data (test URL directly)
2. **CORS errors**: Verify server is running and CORS is configured
3. **Network errors**: Check if backend server is running on port 3001
4. **Cached empty data**: Clear browser cache and hard reload

## ✅ Quick Test

Run this in browser console on `http://localhost:8080`:
```javascript
fetch('http://localhost:3001/api/leaderboard')
  .then(r => r.json())
  .then(data => {
    console.log('Teams received:', data.length);
    console.log('First team:', data[0]);
  })
  .catch(err => console.error('Error:', err));
```

If this works, the API is fine and the issue is in React Query or component rendering.

