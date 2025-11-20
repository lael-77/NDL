# Fix Settings 500 Errors

## Problem
The Settings endpoints are returning 500 errors because the new database tables don't exist yet.

## Temporary Fix Applied
I've added error handling to return empty arrays when tables don't exist, so the page will load (but won't show data until migrations are run).

## Permanent Solution

### Step 1: Stop the Server
**Important**: Stop the Node.js server first (Ctrl+C in the terminal where it's running). The Prisma client file will be locked if the server is running.

### Step 2: Regenerate Prisma Client
```powershell
cd NDL-main\server
npm run prisma:generate
```

### Step 3: Push Schema to Database
```powershell
npm run prisma:push
```

This will create the new tables:
- `school_sponsorships`
- `school_finances`
- `school_notifications`

And add new columns to existing tables:
- `schools` table: `logo_url`, `banner_url`, `address`, `contact_email`, `contact_phone`, `social_media`, `color_theme`, `anthem_url`, `description`, `achievements`
- `teams` table: `home_arena`, `team_colors`, `category`, `coach_can_manage_lineups`, `coach_can_edit_info`, `coach_can_upload_submissions`, `coach_can_view_analytics`, `coach_can_manage_finances`

### Step 4: Restart the Server
```powershell
npm run dev
```

## Alternative: Use Migrations

If you prefer to use migrations instead:

```powershell
cd NDL-main\server
npm run prisma:migrate
```

When prompted, name the migration: `add_school_settings`

## Verify

After running the commands, refresh the Settings page. You should see:
- Empty lists initially (no data yet)
- No more 500 errors
- Ability to create new records

## If You Still Get Errors

1. Check server console for specific error messages
2. Verify database connection in `.env` file
3. Make sure MySQL/PostgreSQL is running
4. Try `npm run prisma:studio` to verify tables exist

