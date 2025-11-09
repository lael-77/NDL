-- Remove unique constraint on coaches.school_id to allow multiple coaches per school
ALTER TABLE coaches DROP INDEX coaches_school_id_key;

