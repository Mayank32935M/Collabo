-- ==============================================================================
-- COLLABO — PostgreSQL Database Schema
-- Milestone 6: Boards, Users & Canvas Elements Persistence
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. BOARDS TABLE
-- Stores whiteboard metadata and the full serialized JSON snapshot of elements.
-- Storing elements as JSONB allows atomic document saves and ultra-fast fetches.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS boards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL DEFAULT 'Untitled Board',
    elements JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Fast lookup by room_id (e.g., query for GET /api/boards/:id)
CREATE INDEX IF NOT EXISTS idx_boards_room_id ON boards(room_id);

-- Automatic updated_at timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_boards_updated_at ON boards;
CREATE TRIGGER trigger_boards_updated_at
    BEFORE UPDATE ON boards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 2. USERS / PROFILES TABLE (Pre-scaffolded for Step 9 Authentication)
-- Links to Supabase Auth auth.users table when auth is activated.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 3. NORMALIZED CANVAS ELEMENTS TABLE
-- Planned for future granular querying, per-element audit trails, or element locking.
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- Default permissive policies for Milestone 6 development (anonymous reads & writes).
-- In Step 9, we will harden these policies to enforce user room ownership.
-- ------------------------------------------------------------------------------
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read a board by room_id
CREATE POLICY "Public boards are readable by room id"
    ON boards FOR SELECT
    USING (true);

-- Allow anyone to insert a board
CREATE POLICY "Public boards can be created"
    ON boards FOR INSERT
    WITH CHECK (true);

-- Allow anyone to update a board
CREATE POLICY "Public boards can be updated"
    ON boards FOR UPDATE
    USING (true);

