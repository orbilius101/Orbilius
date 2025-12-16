-- Export Current Database Schema
-- Run each section separately by copying and pasting into Supabase SQL Editor
-- ============================================================================

-- ============================================
-- SECTION 1: ALL TABLES AND THEIR COLUMNS
-- ============================================
SELECT 
    table_schema || '.' || table_name as table_name,
    column_name,
    data_type,
    character_maximum_length,
    column_default,
    is_nullable,
    ordinal_position
FROM information_schema.columns
WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'auth', 'storage', 'extensions')
ORDER BY table_schema, table_name, ordinal_position;

-- ============================================
-- SECTION 2: CONSTRAINTS (PKs, FKs, etc)
-- ============================================
SELECT 
    tc.constraint_type,
    tc.table_schema || '.' || tc.table_name as table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_schema || '.' || ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
LEFT JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema NOT IN ('pg_catalog', 'information_schema', 'auth', 'storage', 'extensions')
ORDER BY tc.table_schema, tc.table_name, tc.constraint_type;

-- ============================================
-- SECTION 3: RLS POLICIES (MOST IMPORTANT!)
-- ============================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'auth', 'storage', 'extensions')
ORDER BY schemaname, tablename, policyname;

-- ============================================
-- SECTION 4: RLS STATUS (Which tables have RLS enabled)
-- ============================================
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'auth', 'storage', 'extensions')
ORDER BY schemaname, tablename;

-- ============================================
-- SECTION 5: FUNCTIONS
-- ============================================
SELECT 
    n.nspname as schema,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema', 'auth', 'storage', 'extensions')
ORDER BY n.nspname, p.proname;

-- ============================================
-- SECTION 6: TRIGGERS
-- ============================================
SELECT 
    event_object_schema as table_schema,
    event_object_table as table_name,
    trigger_name,
    event_manipulation as event,
    action_timing as timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema NOT IN ('pg_catalog', 'information_schema', 'auth', 'storage', 'extensions')
ORDER BY event_object_schema, event_object_table, trigger_name;

-- ============================================
-- SECTION 7: VIEWS
-- ============================================
SELECT 
    table_schema,
    table_name as view_name,
    view_definition
FROM information_schema.views
WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'auth', 'storage', 'extensions')
ORDER BY table_schema, table_name;

-- ============================================
-- SECTION 8: INDEXES
-- ============================================
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'auth', 'storage', 'extensions')
ORDER BY schemaname, tablename, indexname;

-- ============================================
-- SECTION 9: STORAGE BUCKETS
-- ============================================
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
ORDER BY name;
