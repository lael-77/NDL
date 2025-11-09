# Database Relationships and Authority Structure

## Overview
This document describes the logical relationships between entities and the role-based access control (RBAC) system implemented in the NDL platform.

## Database Relationships

### Student Relationships
Every student is linked to:
1. **School** (direct relationship via `studentSchoolId`)
   - Students belong to a school
   - Access: `Profile.studentSchoolId → School.id`

2. **Team** (through `TeamMember`)
   - Students are members of teams
   - Access: `Profile → TeamMember → Team`

3. **Coach** (through school relationship)
   - Students are managed by their school's coach
   - Access: `Profile.studentSchoolId → School.id → School.coach → Coach`

### Complete Relationship Chain
```
Student (Profile)
  ├── studentSchoolId → School
  │     ├── coach → Coach
  │     ├── teams → Team[]
  │     │     └── members → TeamMember[]
  │     │           └── player → Profile (Student)
  │     └── schoolAdmins → Profile[] (School Admin)
  └── teamMembers → TeamMember[]
        └── team → Team
              └── school → School
```

## Authority Structure

### 1. League Admin (`admin`)
**Manages:** All subjects across the entire system

**Access:**
- All schools
- All teams
- All students
- All coaches
- All judges
- All sponsors
- All school admins
- All matches
- All challenges
- All arenas

**Endpoints:**
- `GET /api/management/admin/students` - Get all students
- `GET /api/management/admin/coaches` - Get all coaches
- `GET /api/management/admin/schools` - Get all schools

### 2. School Admin (`school_admin`)
**Manages:** Profiles of coaches, students, and sponsors in their school

**Access:**
- Their assigned school
- Students in their school
- Coaches in their school
- Sponsors linked to their school
- Teams in their school

**Endpoints:**
- `GET /api/management/school/students` - Get students in their school
- `GET /api/management/school/coaches` - Get coaches in their school
- `GET /api/management/school/sponsors` - Get sponsors for their school
- `POST /api/management/school/students` - Create student in their school
- `PUT /api/management/school/students/:id` - Update student in their school

### 3. Coach (`coach`)
**Manages:** Students in their school

**Access:**
- Their assigned school
- Students in their school
- Teams in their school
- Student progress and academy data

**Endpoints:**
- `GET /api/management/coach/students` - Get students they manage
- `GET /api/management/coach/students/:id` - Get student details
- `PUT /api/management/coach/students/:id/progress` - Update student progress

## Data Flow

### Student Creation Flow
1. **School Admin** creates a student
   - Student is assigned to school admin's school (`studentSchoolId`)
   - Student can be added to a team via `TeamMember`

2. **Coach** can view and manage students
   - Coach accesses students through their school relationship
   - Coach can update student progress (XP, academy progress)

3. **League Admin** has full access
   - Can view and manage all students across all schools

### Access Control Logic

```javascript
// League Admin: Full access
if (user.role === 'admin') {
  // Access granted to all resources
}

// School Admin: School-scoped access
if (user.role === 'school_admin') {
  // Access limited to user.schoolId
  // Can manage: students, coaches, sponsors in their school
}

// Coach: Student management in their school
if (user.role === 'coach') {
  // Access limited to coach.schoolId
  // Can manage: students in their school
}
```

## Database Schema Updates

### New Fields Added
- `Profile.studentSchoolId` - Direct link from student to school
- `School.students` - Reverse relation from school to students

### Relationships Established
1. **Student → School** (direct)
   - `Profile.studentSchoolId → School.id`

2. **Student → Team** (through TeamMember)
   - `Profile → TeamMember → Team`

3. **Student → Coach** (through School)
   - `Profile.studentSchoolId → School.id → School.coach → Coach`

## API Endpoints Summary

### League Admin Endpoints
```
GET  /api/management/admin/students    - Get all students
GET  /api/management/admin/coaches    - Get all coaches
GET  /api/management/admin/schools    - Get all schools
```

### School Admin Endpoints
```
GET  /api/management/school/students  - Get students in school
GET  /api/management/school/coaches  - Get coaches in school
GET  /api/management/school/sponsors - Get sponsors for school
POST /api/management/school/students - Create student
PUT  /api/management/school/students/:id - Update student
```

### Coach Endpoints
```
GET  /api/management/coach/students              - Get managed students
GET  /api/management/coach/students/:id           - Get student details
PUT  /api/management/coach/students/:id/progress  - Update student progress
```

## Security Notes

1. **Authentication Required:** All management endpoints require JWT authentication
2. **Role-Based Access:** Middleware enforces role-based access control
3. **School Scoping:** School admins and coaches can only access their school's resources
4. **Data Isolation:** Users cannot access data outside their authority scope

## Migration Steps

1. **Update Database Schema:**
   ```bash
   cd server
   npx prisma db push
   ```

2. **Reseed Database:**
   ```bash
   node prisma/seed.js
   ```

3. **Restart Server:**
   ```bash
   node src/index.js
   ```

## Testing

### Test League Admin Access
```bash
# Login as admin
POST /api/auth/login
{
  "email": "admin@ndl.rw",
  "password": "Admin@NDL2024"
}

# Get all students
GET /api/management/admin/students
Authorization: Bearer <token>
```

### Test School Admin Access
```bash
# Login as school admin
POST /api/auth/login
{
  "email": "<school_admin_email>",
  "password": "password123"
}

# Get students in their school
GET /api/management/school/students
Authorization: Bearer <token>
```

### Test Coach Access
```bash
# Login as coach
POST /api/auth/login
{
  "email": "<coach_email>",
  "password": "password123"
}

# Get students they manage
GET /api/management/coach/students
Authorization: Bearer <token>
```

