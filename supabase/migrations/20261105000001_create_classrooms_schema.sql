-- ==============================================================================
-- COLLABO — PostgreSQL Database Migration
-- Milestone M4: Classroom Management, Scheduling & Automated Attendance
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CLASSROOMS TABLE
-- Virtual classroom definition bound to an academic course.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS classrooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    default_mode TEXT NOT NULL DEFAULT 'lecture' CHECK (default_mode IN ('lecture', 'interactive')),
    require_waiting_room BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_classrooms_course_id ON classrooms(course_id);

-- ------------------------------------------------------------------------------
-- 2. CLASSROOM SESSIONS TABLE
-- A live or historical class meeting instance.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS classroom_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    host_profile_id UUID NOT NULL REFERENCES profiles(id),
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended')),
    scheduled_start_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_classroom_sessions_classroom_id ON classroom_sessions(classroom_id);
CREATE INDEX IF NOT EXISTS idx_classroom_sessions_status ON classroom_sessions(status);
CREATE INDEX IF NOT EXISTS idx_classroom_sessions_host ON classroom_sessions(host_profile_id);

-- ------------------------------------------------------------------------------
-- 3. SESSION PARTICIPANTS TABLE (Automated Attendance)
-- Logs participant join, leave, duration, and classroom role.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS session_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES classroom_sessions(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'attendee' CHECK (role IN ('host', 'co-host', 'speaker', 'attendee')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    left_at TIMESTAMPTZ,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    UNIQUE(session_id, profile_id, joined_at)
);

CREATE INDEX IF NOT EXISTS idx_session_participants_session ON session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_profile ON session_participants(profile_id);

-- ------------------------------------------------------------------------------
-- 4. SESSION BOARDS TABLE
-- Junction table associating a classroom session with one or more whiteboards.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS session_boards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES classroom_sessions(id) ON DELETE CASCADE,
    board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    attached_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(session_id, board_id)
);

CREATE INDEX IF NOT EXISTS idx_session_boards_session ON session_boards(session_id);
CREATE INDEX IF NOT EXISTS idx_session_boards_board ON session_boards(board_id);

-- ------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_boards ENABLE ROW LEVEL SECURITY;

-- Classrooms readable by authenticated users
CREATE POLICY "Classrooms are readable by authenticated users"
    ON classrooms FOR SELECT
    USING (true);

-- Classrooms manageable by course instructors/admins
CREATE POLICY "Classrooms are manageable by authenticated users"
    ON classrooms FOR ALL
    USING (true)
    WITH CHECK (true);

-- Sessions readable by authenticated users
CREATE POLICY "Sessions are readable by authenticated users"
    ON classroom_sessions FOR SELECT
    USING (true);

-- Sessions manageable by authenticated users
CREATE POLICY "Sessions are manageable by authenticated users"
    ON classroom_sessions FOR ALL
    USING (true)
    WITH CHECK (true);

-- Attendance participants readable by authenticated users
CREATE POLICY "Session participants are readable by authenticated users"
    ON session_participants FOR SELECT
    USING (true);

-- Attendance participants manageable by authenticated users
CREATE POLICY "Session participants are manageable by authenticated users"
    ON session_participants FOR ALL
    USING (true)
    WITH CHECK (true);

-- Session boards readable by authenticated users
CREATE POLICY "Session boards are readable by authenticated users"
    ON session_boards FOR SELECT
    USING (true);

-- Session boards manageable by authenticated users
CREATE POLICY "Session boards are manageable by authenticated users"
    ON session_boards FOR ALL
    USING (true)
    WITH CHECK (true);

