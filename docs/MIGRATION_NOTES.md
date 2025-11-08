# Migration Notes

## Restructuring Complete

The NDL project has been successfully restructured from a single frontend application to a proper client-server architecture.

## What Changed

### 1. Folder Structure
- ✅ Created `client/` folder with all frontend code
- ✅ Created `server/` folder with Express backend
- ✅ Created `docs/` folder with documentation
- ✅ Moved all frontend files to `client/`
- ✅ Removed duplicate files from root

### 2. Backend Implementation
- ✅ Express server setup (`server/src/index.js`)
- ✅ API routes for auth, matches, teams, leaderboard
- ✅ Controllers with business logic
- ✅ Prisma schema based on Supabase migration
- ✅ JWT authentication middleware
- ✅ Scoring service for match points and tier management

### 3. Frontend Updates
- ✅ Added Axios for API calls (`client/src/api/`)
- ✅ Added Zustand for state management (`client/src/store/`)
- ✅ Created API client with interceptors
- ✅ Added authentication store
- ✅ Added matches store

### 4. Documentation
- ✅ Backend specification (`docs/backend_spec.md`)
- ✅ API endpoints documentation (`docs/api_endpoints.md`)
- ✅ Project structure documentation (`docs/structure.md`)
- ✅ Updated root README.md

### 5. Configuration
- ✅ Docker Compose setup
- ✅ Environment variables template
- ✅ Server Dockerfile

## Next Steps

### Immediate Actions Required

1. **Install Dependencies**
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

2. **Set Up Environment Variables**
   - Copy `env.example` to `.env` in root
   - Copy `env.example` to `client/.env` (for VITE variables)
   - Update with your actual values

3. **Database Setup**
   ```bash
   cd server
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev
   
   # Terminal 2 - Frontend
   cd client && npm run dev
   ```

### Code Updates Needed

1. **Update Client to Use New API**
   - Replace Supabase client calls with Axios API calls
   - Update pages to use Zustand stores
   - Update authentication flow

2. **Complete Auth Implementation**
   - Add password field to Profile model (or separate auth table)
   - Implement password hashing in auth controller
   - Add authentication middleware to protected routes

3. **Database Migration**
   - If using existing Supabase database, ensure Prisma schema matches
   - Run migrations to sync schema
   - Consider data migration if needed

## Important Notes

### Supabase Integration
The client still contains Supabase integration files (`client/src/integrations/supabase/`). You can:
- Keep them for reference
- Remove them if switching fully to the new backend
- Use them alongside the new backend if needed

### Authentication
The current auth implementation is a basic structure. You'll need to:
- Add password storage (currently commented out)
- Implement proper password verification
- Add authentication middleware to protected routes
- Handle token refresh

### Database
The Prisma schema is based on the Supabase migration. Ensure:
- Enum values match (currently using lowercase: `beginner`, `intermediate`, etc.)
- Table names match (using `@@map` directives)
- Relationships are correctly defined

## Testing

1. **Test Backend API**
   ```bash
   # Start server
   cd server && npm run dev
   
   # Test health endpoint
   curl http://localhost:3001/health
   ```

2. **Test Frontend**
   ```bash
   # Start client
   cd client && npm run dev
   
   # Open http://localhost:8080
   ```

3. **Test Database Connection**
   ```bash
   cd server
   npx prisma studio
   ```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Change port in `server/src/index.js` or `client/vite.config.ts`
   - Update `VITE_API_BASE_URL` in client `.env`

2. **Database Connection Error**
   - Check `DATABASE_URL` in `.env`
   - Ensure PostgreSQL is running
   - Check database credentials

3. **Prisma Client Not Generated**
   ```bash
   cd server
   npx prisma generate
   ```

4. **Module Not Found Errors**
   - Run `npm install` in both client and server
   - Check import paths
   - Verify file structure

## Migration Checklist

- [x] Create client folder structure
- [x] Create server folder structure
- [x] Move frontend files to client
- [x] Set up Express backend
- [x] Create Prisma schema
- [x] Create API routes and controllers
- [x] Add Axios to client
- [x] Add Zustand to client
- [x] Create API client files
- [x] Create state management stores
- [x] Create documentation
- [x] Create Docker setup
- [x] Update README
- [ ] Install dependencies
- [ ] Set up environment variables
- [ ] Run database migrations
- [ ] Update client to use new API
- [ ] Complete auth implementation
- [ ] Test all endpoints
- [ ] Remove Supabase dependencies (optional)

## Support

For issues or questions, refer to:
- `docs/backend_spec.md` - Backend architecture
- `docs/api_endpoints.md` - API documentation
- `docs/structure.md` - Project structure
- `README.md` - Main documentation

