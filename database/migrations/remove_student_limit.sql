-- Migration: Remove 20 student limit per school
-- Date: 2024-11-14
-- Description: Remove the 20 student limit constraint as students now become reserve players when teams are full

-- Drop the trigger that enforces student limit
DROP TRIGGER IF EXISTS enforce_school_student_limit ON students;

-- Drop the function that checks student limit
DROP FUNCTION IF EXISTS check_school_student_limit();

-- Note: This migration removes the hard limit of 20 students per school.
-- Students can now be added indefinitely, and new students automatically become
-- reserve players when all teams are full (4 players per team).

