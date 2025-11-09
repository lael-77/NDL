# Permission System Documentation

## Overview

The NDL platform implements a comprehensive role-based access control (RBAC) system that provides **live, interactive permissions** throughout the application. Users can only see and interact with resources they have permission to manage.

## Permission Hierarchy

### 1. **Admin (League Admin)**
- **Full Access**: Can manage all resources across the entire system
- **Permissions**: 
  - Manage all schools, teams, players, coaches, judges, sponsors, school admins
  - Create, update, delete any resource
  - View all data and statistics

### 2. **School Admin**
- **Scope**: Their assigned school and all subjects within it
- **Permissions**:
  - Manage their school (update school info, tier)
  - Manage teams in their school (create, update, delete)
  - Manage players in their school (add, remove, update profiles)
  - Manage coaches in their school (assign, remove)
  - Manage sponsors associated with their school
  - View all data within their school

### 3. **Coach**
- **Scope**: Teams and players in their school
- **Permissions**:
  - Manage teams they coach (update team info, assign players)
  - Manage players in their school (update progress, XP, academy data)
  - View matches involving their teams
  - Cannot create/delete teams (only school admin can)

### 4. **Judge**
- **Scope**: Matches they're assigned to
- **Permissions**:
  - Manage matches (update scores, status, winner)
  - View all matches
  - Cannot create matches (only admin, school admin, or coaches can)

### 5. **Player**
- **Scope**: Their own profile and data
- **Permissions**:
  - Manage own profile (update info, avatar)
  - View own teams, matches, progress
  - View leaderboard and challenges
  - Cannot manage other players or teams

### 6. **Sponsor**
- **Scope**: View sponsored schools/teams
- **Permissions**:
  - View schools/teams they sponsor
  - View statistics and performance
  - Cannot manage resources

## Backend Implementation

### Permission Utilities (`server/src/utils/permissions.js`)

The permission system provides utility functions to check permissions:

```javascript
// Check if user can manage a school
canManageSchool(userId, schoolId)

// Check if user can manage a team
canManageTeam(userId, teamId)

// Check if user can manage a player
canManagePlayer(userId, playerId)

// Check if user can manage a coach
canManageCoach(userId, coachId)

// Check if user can manage a match
canManageMatch(userId, matchId)

// Get user's complete permissions object
getUserPermissions(userId)
```

### Controller Integration

All controllers enforce permissions before allowing operations:

```javascript
// Example: Team Controller
export const updateTeam = async (req, res) => {
  const userId = req.user?.userId || req.user?.id;
  const { id } = req.params;
  
  // Check permission
  const hasPermission = await canManageTeam(userId, id);
  if (!hasPermission) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  
  // Proceed with update...
};
```

### API Endpoints

- `GET /api/auth/permissions` - Get current user's permissions
- `GET /api/permissions/check/:resourceType/:resourceId` - Check permission for specific resource

## Frontend Implementation

### Permission Hook (`client/src/hooks/usePermissions.ts`)

```typescript
const { can, permissions, isLoading } = usePermissions();

// Check if user can perform an action
if (can("manage:team")) {
  // Show team management UI
}

// Check specific resource
const canManage = await canManage("team", teamId);
```

### PermissionGate Component

Conditionally renders UI based on permissions:

```tsx
<PermissionGate action="manage:team" resourceId={teamId}>
  <Button>Edit Team</Button>
</PermissionGate>
```

### PermissionButton Component

Button that's automatically disabled if user lacks permission:

```tsx
<PermissionButton 
  action="manage:player" 
  resourceId={playerId}
  onClick={handleEdit}
>
  Edit Player
</PermissionButton>
```

## Interactive Features

### Live Permission Checks

1. **UI Visibility**: Buttons and actions only appear if user has permission
2. **Disabled States**: Actions are disabled (not hidden) if permission is denied
3. **Real-time Updates**: Permissions are cached and refreshed automatically
4. **Error Handling**: Clear error messages when permission is denied

### Examples in Dashboards

#### School Admin Dashboard
- **Create Team Button**: Only visible if user can manage teams
- **Edit Player**: Only visible for players in their school
- **Replace Coach**: Only visible if user can manage coaches
- **Manage Sponsors**: Only visible if user can manage sponsors

#### Admin Dashboard
- **All Management Actions**: Always visible (admin has full access)
- **Role-specific Sections**: Organized by role with full CRUD operations

## Permission Flow

1. **User Login**: Permissions are fetched and cached
2. **UI Rendering**: Components check permissions before rendering
3. **Action Attempt**: Backend verifies permission before processing
4. **Response**: Success or 403 Forbidden with clear error message

## Security

- **Backend Enforcement**: All permissions are checked server-side
- **Frontend UX**: UI adapts based on permissions for better UX
- **No Client-side Security**: Frontend checks are for UX only, not security
- **Token-based**: Permissions are tied to authenticated user tokens

## Best Practices

1. **Always check permissions on the backend** - Never trust frontend-only checks
2. **Use PermissionGate for conditional rendering** - Better UX than hiding elements
3. **Provide clear error messages** - Help users understand why actions are denied
4. **Cache permissions** - Reduce API calls with 5-minute cache
5. **Refresh on role changes** - Invalidate cache when user role changes

## Future Enhancements

- Fine-grained permissions (e.g., "can edit team name but not delete team")
- Permission inheritance (e.g., team captain inherits some coach permissions)
- Audit logging of permission checks
- Permission templates for different organization types

