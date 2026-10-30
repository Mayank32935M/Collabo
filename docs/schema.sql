-- ==============================================================================
-- COLLABO — PostgreSQL Database Schema Reference
-- Milestone 6: Backend API & PostgreSQL Database Persistence
-- ==============================================================================

-- 1. Boards Table (Primary persistence for collaborative whiteboards)
CREATE TABLE IF NOT EXISTS boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL DEFAULT 'Untitled Board',
    elements JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_boards_room_id ON boards(room_id);

-- 2. Profiles Table (User identity schema - to be integrated in Step 9)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Canvas Elements Table (Normalized schema for granular element queries)
CREATE TABLE IF NOT EXISTS canvas_elements (
    id TEXT PRIMARY KEY,
    board_room_id TEXT NOT NULL REFERENCES boards(room_id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    x NUMERIC NOT NULL,
    y NUMERIC NOT NULL,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_canvas_elements_board ON canvas_elements(board_room_id);

