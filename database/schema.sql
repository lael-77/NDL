-- NDL School Admin System - Complete Database Schema
-- PostgreSQL 15+ with constraints for 20 students per school and 4 active members per team

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table (base authentication)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('school_admin', 'league_admin', 'teacher', 'judge', 'student', 'mentor')),
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
    profile_data JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_school_id ON users(school_id);

-- Schools table
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    admin_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schools_admin_user_id ON schools(admin_user_id);

-- Students table (extends users)
CREATE TABLE students (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_number VARCHAR(50) UNIQUE,
    age INTEGER CHECK (age >= 10 AND age <= 25),
    grade INTEGER CHECK (grade >= 1 AND grade <= 12),
    level VARCHAR(50) DEFAULT 'beginner',
    stage VARCHAR(50) DEFAULT 'enrolled',
    xp INTEGER DEFAULT 0,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_students_school_id ON students(school_id);
CREATE INDEX idx_students_student_number ON students(student_number);

-- Teams table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(school_id, name)
);

CREATE INDEX idx_teams_school_id ON teams(school_id);

-- Team members table (enforces 4 active members per team)
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    role VARCHAR(50) CHECK (role IN ('Developer', 'Designer', 'Strategist', 'Captain')),
    is_active BOOLEAN DEFAULT true,
    is_captain BOOLEAN DEFAULT false,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, student_id)
);

CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_student_id ON team_members(student_id);
CREATE INDEX idx_team_members_active ON team_members(team_id, is_active) WHERE is_active = true;

-- Leagues table
CREATE TABLE leagues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    season VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Matches/Fixtures table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID REFERENCES leagues(id) ON DELETE SET NULL,
    team_a_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    team_b_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    arena_id UUID,
    team_a_score INTEGER DEFAULT 0,
    team_b_score INTEGER DEFAULT 0,
    winner_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (team_a_id != team_b_id)
);

CREATE INDEX idx_matches_league_id ON matches(league_id);
CREATE INDEX idx_matches_team_a_id ON matches(team_a_id);
CREATE INDEX idx_matches_team_b_id ON matches(team_b_id);
CREATE INDEX idx_matches_scheduled_at ON matches(scheduled_at);

-- Submissions table
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    challenge_id UUID,
    files JSONB DEFAULT '[]',
    code_url TEXT,
    documentation_url TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'reviewed', 'approved', 'rejected')),
    ai_score DECIMAL(5,2) CHECK (ai_score >= 0 AND ai_score <= 100),
    human_score DECIMAL(5,2) CHECK (human_score >= 0 AND human_score <= 100),
    final_score DECIMAL(5,2) CHECK (final_score >= 0 AND final_score <= 100),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_submissions_student_id ON submissions(student_id);
CREATE INDEX idx_submissions_team_id ON submissions(team_id);
CREATE INDEX idx_submissions_match_id ON submissions(match_id);

-- Judges table
CREATE TABLE judges (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(255),
    rating DECIMAL(3,2) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
    matches_judged INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Judge scores table
CREATE TABLE judge_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    judge_id UUID NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    scores JSONB NOT NULL, -- { correctness, efficiency, originality, docs, tests }
    comments TEXT,
    score_value DECIMAL(5,2) CHECK (score_value >= 0 AND score_value <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(match_id, judge_id, team_id)
);

CREATE INDEX idx_judge_scores_match_id ON judge_scores(match_id);
CREATE INDEX idx_judge_scores_judge_id ON judge_scores(judge_id);

-- AI scores table
CREATE TABLE ai_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    correctness DECIMAL(5,2) CHECK (correctness >= 0 AND correctness <= 40),
    efficiency DECIMAL(5,2) CHECK (efficiency >= 0 AND efficiency <= 20),
    originality DECIMAL(5,2) CHECK (originality >= 0 AND originality <= 20),
    docs_and_tests DECIMAL(5,2) CHECK (docs_and_tests >= 0 AND docs_and_tests <= 20),
    total_score DECIMAL(5,2) CHECK (total_score >= 0 AND total_score <= 100),
    analysis JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_scores_submission_id ON ai_scores(submission_id);

-- Teachers table
CREATE TABLE teachers (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    specialization VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teachers_school_id ON teachers(school_id);

-- Mentors table
CREATE TABLE mentors (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    max_mentees INTEGER DEFAULT 5 CHECK (max_mentees >= 1 AND max_mentees <= 20),
    specialization_tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mentor-student relationships
CREATE TABLE mentor_students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'ended')),
    UNIQUE(mentor_id, student_id)
);

CREATE INDEX idx_mentor_students_mentor_id ON mentor_students(mentor_id);
CREATE INDEX idx_mentor_students_student_id ON mentor_students(student_id);

-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty VARCHAR(50) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    modules JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student course progress
CREATE TABLE student_course_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    completed_modules INTEGER DEFAULT 0,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(student_id, course_id)
);

CREATE INDEX idx_student_course_progress_student_id ON student_course_progress(student_id);
CREATE INDEX idx_student_course_progress_course_id ON student_course_progress(course_id);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT false,
    channel VARCHAR(50) DEFAULT 'in_app',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read) WHERE read = false;

-- Audit log table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- CONSTRAINTS & TRIGGERS
-- ============================================================================

-- NOTE: Student limit removed - schools can now have unlimited students
-- New students automatically become reserve players when all teams are full (4 players per team)
-- Reserve players can be swapped into teams as needed
-- 
-- Previous limit (REMOVED):
-- CREATE OR REPLACE FUNCTION check_school_student_limit()
-- RETURNS TRIGGER AS $$
-- DECLARE
--     student_count INTEGER;
-- BEGIN
--     SELECT COUNT(*) INTO student_count
--     FROM students
--     WHERE school_id = NEW.school_id;
--     
--     IF student_count >= 20 THEN
--         RAISE EXCEPTION 'School has reached maximum student limit of 20. Current count: %', student_count;
--     END IF;
--     
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
--
-- CREATE TRIGGER enforce_school_student_limit
-- BEFORE INSERT ON students
-- FOR EACH ROW
-- EXECUTE FUNCTION check_school_student_limit();

-- Function to enforce 4 active members per team
CREATE OR REPLACE FUNCTION check_team_active_member_limit()
RETURNS TRIGGER AS $$
DECLARE
    active_count INTEGER;
BEGIN
    -- Only check if setting is_active to true
    IF NEW.is_active = true THEN
        SELECT COUNT(*) INTO active_count
        FROM team_members
        WHERE team_id = NEW.team_id
        AND is_active = true
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);
        
        IF active_count >= 4 THEN
            RAISE EXCEPTION 'Team has reached maximum active member limit of 4. Current active count: %', active_count;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce team member limit
CREATE TRIGGER enforce_team_active_member_limit
BEFORE INSERT OR UPDATE ON team_members
FOR EACH ROW
EXECUTE FUNCTION check_team_active_member_limit();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate final score from AI and human scores
CREATE OR REPLACE FUNCTION calculate_final_score(ai_score DECIMAL, human_score DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    IF ai_score IS NULL OR human_score IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- 60% AI + 40% Human
    RETURN ROUND((ai_score * 0.6 + human_score * 0.4)::numeric, 2);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate final_score in submissions
CREATE OR REPLACE FUNCTION update_submission_final_score()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ai_score IS NOT NULL AND NEW.human_score IS NOT NULL THEN
        NEW.final_score = calculate_final_score(NEW.ai_score, NEW.human_score);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_submission_final_score_trigger
BEFORE INSERT OR UPDATE ON submissions
FOR EACH ROW
EXECUTE FUNCTION update_submission_final_score();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View for school statistics
CREATE OR REPLACE VIEW school_stats AS
SELECT 
    s.id,
    s.name,
    COUNT(DISTINCT st.id) as student_count,
    COUNT(DISTINCT t.id) as team_count,
    COUNT(DISTINCT CASE WHEN st.progress_percentage < 50 THEN st.id END) as at_risk_students,
    AVG(st.progress_percentage) as avg_progress
FROM schools s
LEFT JOIN students st ON st.school_id = s.id
LEFT JOIN teams t ON t.school_id = s.id
GROUP BY s.id, s.name;

-- View for team member counts
CREATE OR REPLACE VIEW team_member_counts AS
SELECT 
    t.id as team_id,
    t.name as team_name,
    COUNT(CASE WHEN tm.is_active = true THEN 1 END) as active_members,
    COUNT(CASE WHEN tm.is_active = false THEN 1 END) as inactive_members,
    COUNT(tm.id) as total_members
FROM teams t
LEFT JOIN team_members tm ON tm.team_id = t.id
GROUP BY t.id, t.name;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Composite indexes for common queries
CREATE INDEX idx_students_school_progress ON students(school_id, progress_percentage);
CREATE INDEX idx_team_members_team_active ON team_members(team_id, is_active);
CREATE INDEX idx_matches_status_scheduled ON matches(status, scheduled_at);
CREATE INDEX idx_submissions_match_status ON submissions(match_id, status);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read, created_at);

-- Full-text search indexes
CREATE INDEX idx_schools_name_trgm ON schools USING gin(name gin_trgm_ops);
CREATE INDEX idx_students_search ON students USING gin(to_tsvector('english', student_number || ' ' || COALESCE((SELECT email FROM users WHERE id = students.id), '')));

