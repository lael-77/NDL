# API Endpoints Documentation

## Base URL

```
http://localhost:3001/api
```

## Authentication Endpoints

### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "role": "player"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "player"
  },
  "token": "jwt-token"
}
```

### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "player"
  },
  "token": "jwt-token"
}
```

### Get Profile

```http
GET /api/auth/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "player",
  "avatarUrl": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Match Endpoints

### Get All Matches

```http
GET /api/matches
```

**Response:**
```json
[
  {
    "id": "uuid",
    "homeTeamId": "uuid",
    "awayTeamId": "uuid",
    "scheduledAt": "2024-01-01T00:00:00.000Z",
    "status": "scheduled",
    "homeScore": 0,
    "awayScore": 0,
    "homeTeam": { ... },
    "awayTeam": { ... }
  }
]
```

### Get Match by ID

```http
GET /api/matches/:id
```

### Create Match

```http
POST /api/matches
Authorization: Bearer <token>
Content-Type: application/json

{
  "homeTeamId": "uuid",
  "awayTeamId": "uuid",
  "scheduledAt": "2024-01-01T00:00:00.000Z",
  "status": "scheduled"
}
```

### Update Match

```http
PUT /api/matches/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "homeScore": 2,
  "awayScore": 1,
  "status": "completed",
  "winnerId": "uuid"
}
```

### Delete Match

```http
DELETE /api/matches/:id
Authorization: Bearer <token>
```

## Team Endpoints

### Get All Teams

```http
GET /api/teams
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Team Name",
    "schoolId": "uuid",
    "captainId": "uuid",
    "points": 100,
    "wins": 10,
    "draws": 2,
    "losses": 1,
    "school": { ... },
    "captain": { ... },
    "members": [ ... ]
  }
]
```

### Get Team by ID

```http
GET /api/teams/:id
```

### Create Team

```http
POST /api/teams
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Team Name",
  "schoolId": "uuid",
  "captainId": "uuid",
  "logoUrl": "https://example.com/logo.png"
}
```

### Update Team

```http
PUT /api/teams/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Team Name",
  "points": 150,
  "wins": 15
}
```

## Leaderboard Endpoints

### Get Global Leaderboard

```http
GET /api/leaderboard
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Team Name",
    "points": 100,
    "wins": 10,
    "school": {
      "name": "School Name",
      "tier": "national",
      "location": "City"
    }
  }
]
```

### Get Leaderboard by Tier

```http
GET /api/leaderboard/:tier
```

**Tier values:** `beginner`, `intermediate`, `advanced`, `regional`, `national`

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message"
}
```

**Status Codes:**
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

