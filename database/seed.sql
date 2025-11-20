-- Seed Data for NDL School Admin System
-- Creates 2 schools, 10 students each, 2 teams per school (4 active members each)

-- Insert Schools
INSERT INTO schools (id, name, country, city) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Kigali International School', 'Rwanda', 'Kigali'),
('550e8400-e29b-41d4-a716-446655440002', 'Butare Academy', 'Rwanda', 'Butare');

-- Insert School Admins
INSERT INTO users (id, email, password_hash, role, school_id) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'admin@kigali.school', '$2b$10$example_hash_here', 'school_admin', '550e8400-e29b-41d4-a716-446655440001'),
('650e8400-e29b-41d4-a716-446655440002', 'admin@butare.school', '$2b$10$example_hash_here', 'school_admin', '550e8400-e29b-41d4-a716-446655440002');

-- Update schools with admin IDs
UPDATE schools SET admin_user_id = '650e8400-e29b-41d4-a716-446655440001' WHERE id = '550e8400-e29b-41d4-a716-446655440001';
UPDATE schools SET admin_user_id = '650e8400-e29b-41d4-a716-446655440002' WHERE id = '550e8400-e29b-41d4-a716-446655440002';

-- Insert Students for Kigali International School (10 students)
INSERT INTO users (id, email, password_hash, role, school_id) VALUES
('750e8400-e29b-41d4-a716-446655440001', 'student1@kigali.school', '$2b$10$example', 'student', '550e8400-e29b-41d4-a716-446655440001'),
('750e8400-e29b-41d4-a716-446655440002', 'student2@kigali.school', '$2b$10$example', 'student', '550e8400-e29b-41d4-a716-446655440001'),
('750e8400-e29b-41d4-a716-446655440003', 'student3@kigali.school', '$2b$10$example', 'student', '550e8400-e29b-41d4-a716-446655440001'),
('750e8400-e29b-41d4-a716-446655440004', 'student4@kigali.school', '$2b$10$example', 'student', '550e8400-e29b-41d4-a716-446655440001'),
('750e8400-e29b-41d4-a716-446655440005', 'student5@kigali.school', '$2b$10$example', 'student', '550e8400-e29b-41d4-a716-446655440001'),
('750e8400-e29b-41d4-a716-446655440006', 'student6@kigali.school', '$2b$10$example', 'student', '550e8400-e29b-41d4-a716-446655440001'),
('750e8400-e29b-41d4-a716-446655440007', 'student7@kigali.school', '$2b$10$example', 'student', '550e8400-e29b-41d4-a716-446655440001'),
('750e8400-e29b-41d4-a716-446655440008', 'student8@kigali.school', '$2b$10$example', 'student', '550e8400-e29b-41d4-a716-446655440001'),
('750e8400-e29b-41d4-a716-446655440009', 'student9@kigali.school', '$2b$10$example', 'student', '550e8400-e29b-41d4-a716-446655440001'),
('750e8400-e29b-41d4-a716-446655440010', 'student10@kigali.school', '$2b$10$example', 'student', '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO students (id, school_id, student_number, age, grade, level, xp, progress_percentage) VALUES
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'KIS001', 16, 10, 'beginner', 100, 65),
('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'KIS002', 17, 11, 'intermediate', 250, 75),
('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'KIS003', 15, 9, 'beginner', 50, 45),
('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'KIS004', 16, 10, 'intermediate', 200, 80),
('750e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'KIS005', 18, 12, 'advanced', 500, 90),
('750e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 'KIS006', 16, 10, 'beginner', 75, 55),
('750e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', 'KIS007', 17, 11, 'intermediate', 300, 70),
('750e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', 'KIS008', 15, 9, 'beginner', 25, 30),
('750e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440001', 'KIS009', 16, 10, 'intermediate', 150, 60),
('750e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'KIS010', 17, 11, 'advanced', 400, 85);

-- Insert Students for Butare Academy (10 students)
INSERT INTO users (id, email, password_hash, role, school_id) VALUES
('850e8400-e29b-41d4-a716-446655440001', 'student1@butare.school', '$2b$10$example', 'student', '550e8400-e29b-41d4-a716-446655440002'),
('850e8400-e29b-41d4-a716-446655440002', 'student2@butare.school', '$2b$10$example', 'student', '550e8400-e29b-41d4-a716-446655440002'),
('850e8400-e29b-41d4-a716-446655440003', 'student3@butare.school', '$2b$10$example', 'student', '550e8400-e29b-41d4-a716-446655440002'),
('850e8400-e29b-41d4-a716-446655440004', 'student4@butare.school', '$2b$10$example', 'student', '550e8400-e29b-41d4-a716-446655440002'),
('850e8400-e29b-41d4-a716-446655440005', 'student5@butare.school', '$2b$10$example', 'student', '550e8400-e29b-41d4-a716-446655440002'),
('850e8400-e29b-41d4-a716-446655440006', 'student6@butare.school', '$2b$10$example', 'student', '550e8400-e29b-41d4-a716-446655440002'),
('850e8400-e29b-41d4-a716-446655440007', 'student7@butare.school', '$2b$10$example', 'student', '550e8400-e29b-41d4-a716-446655440002'),
('850e8400-e29b-41d4-a716-446655440008', 'student8@butare.school', '$2b$10$example', 'student', '550e8400-e29b-41d4-a716-446655440002'),
('850e8400-e29b-41d4-a716-446655440009', 'student9@butare.school', '$2b$10$example', 'student', '550e8400-e29b-41d4-a716-446655440002'),
('850e8400-e29b-41d4-a716-446655440010', 'student10@butare.school', '$2b$10$example', 'student', '550e8400-e29b-41d4-a716-446655440002');

INSERT INTO students (id, school_id, student_number, age, grade, level, xp, progress_percentage) VALUES
('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'BA001', 16, 10, 'beginner', 120, 68),
('850e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'BA002', 17, 11, 'intermediate', 280, 78),
('850e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'BA003', 15, 9, 'beginner', 60, 50),
('850e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'BA004', 16, 10, 'intermediate', 220, 82),
('850e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'BA005', 18, 12, 'advanced', 550, 92),
('850e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'BA006', 16, 10, 'beginner', 80, 58),
('850e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'BA007', 17, 11, 'intermediate', 320, 72),
('850e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002', 'BA008', 15, 9, 'beginner', 30, 35),
('850e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440002', 'BA009', 16, 10, 'intermediate', 180, 65),
('850e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 'BA010', 17, 11, 'advanced', 450, 88);

-- Create Teams for Kigali International School (2 teams, 4 members each)
INSERT INTO teams (id, school_id, name, status) VALUES
('950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Kigali Eagles', 'active'),
('950e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Kigali Lions', 'active');

-- Team 1 Members (Kigali Eagles) - 4 active
INSERT INTO team_members (team_id, student_id, role, is_active, is_captain) VALUES
('950e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 'Captain', true, true),
('950e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440002', 'Developer', true, false),
('950e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440003', 'Designer', true, false),
('950e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440004', 'Strategist', true, false);

-- Team 2 Members (Kigali Lions) - 4 active
INSERT INTO team_members (team_id, student_id, role, is_active, is_captain) VALUES
('950e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440005', 'Captain', true, true),
('950e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440006', 'Developer', true, false),
('950e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440007', 'Designer', true, false),
('950e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440008', 'Strategist', true, false);

-- Create Teams for Butare Academy (2 teams, 4 members each)
INSERT INTO teams (id, school_id, name, status) VALUES
('950e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Butare Warriors', 'active'),
('950e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Butare Champions', 'active');

-- Team 3 Members (Butare Warriors) - 4 active
INSERT INTO team_members (team_id, student_id, role, is_active, is_captain) VALUES
('950e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440001', 'Captain', true, true),
('950e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440002', 'Developer', true, false),
('950e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440003', 'Designer', true, false),
('950e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440004', 'Strategist', true, false);

-- Team 4 Members (Butare Champions) - 4 active
INSERT INTO team_members (team_id, student_id, role, is_active, is_captain) VALUES
('950e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440005', 'Captain', true, true),
('950e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440006', 'Developer', true, false),
('950e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440007', 'Designer', true, false),
('950e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440008', 'Strategist', true, false);

-- Create a League
INSERT INTO leagues (id, name, season, status, start_date, end_date) VALUES
('a50e8400-e29b-41d4-a716-446655440001', 'NDL 2025 Season', '2025', 'active', '2025-01-01', '2025-12-31');

-- Create a sample match
INSERT INTO matches (id, league_id, team_a_id, team_b_id, scheduled_at, status) VALUES
('b50e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440001', 
 '950e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440003',
 '2025-12-15 10:00:00', 'scheduled');

