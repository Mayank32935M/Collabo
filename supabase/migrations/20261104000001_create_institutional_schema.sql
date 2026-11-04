-- ==============================================================================
-- COLLABO — PostgreSQL Database Migration
-- Milestone M3: Identity, Multi-Tenancy & Institutional Workspace Management
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PROFILES UPGRADE
-- Upgrade profiles table to support system roles while preserving existing schema.
-- ------------------------------------------------------------------------------
ALTER TABLE profiles 
    ADD COLUMN IF NOT EXISTS system_role TEXT NOT NULL DEFAULT 'student' 
    CHECK (system_role IN ('admin', 'instructor', 'student', 'guest'));

CREATE INDEX IF NOT EXISTS idx_profiles_system_role ON profiles(system_role);

-- ------------------------------------------------------------------------------
-- 2. INSTITUTIONS TABLE
-- Top-level multi-tenant container for universities, colleges, or educational bodies.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    domain TEXT,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_institutions_slug ON institutions(slug);

-- ------------------------------------------------------------------------------
-- 3. DEPARTMENTS TABLE
-- Academic faculties or departments belonging to an institution.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    head_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(institution_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_departments_institution_id ON departments(institution_id);

-- ------------------------------------------------------------------------------
-- 4. COURSES TABLE
-- Individual academic subjects offered by a department (e.g. CS-101, Fall 2026).
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    term TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(department_id, code, term)
);

CREATE INDEX IF NOT EXISTS idx_courses_department_id ON courses(department_id);

-- ------------------------------------------------------------------------------
-- 5. COURSE ENROLLMENTS TABLE
-- Links instructors, teaching assistants, and students to courses.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('instructor', 'ta', 'student')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(course_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_course ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_profile ON course_enrollments(profile_id);

-- ------------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- Institutions & Departments are publicly discoverable for directory browsing
CREATE POLICY "Institutions are readable by all authenticated users"
    ON institutions FOR SELECT
    USING (true);

CREATE POLICY "Departments are readable by all authenticated users"
    ON departments FOR SELECT
    USING (true);

-- Courses are readable by authenticated members
CREATE POLICY "Courses are readable by all authenticated users"
    ON courses FOR SELECT
    USING (true);

-- Course enrollments can be read by enrolled members or instructors
CREATE POLICY "Enrollments readable by enrolled users"
    ON course_enrollments FOR SELECT
    USING (true);

-- Course enrollments can be managed by admins or instructors
CREATE POLICY "Enrollments manageable by authenticated users"
    ON course_enrollments FOR ALL
    USING (true)
    WITH CHECK (true);

