-- =========================
-- users
-- =========================
INSERT INTO users (id, email, password_hash, display_name) VALUES
('11111111-1111-1111-1111-111111111111', 'user1@test.com', 'hashed_password_1', 'User One'),
('22222222-2222-2222-2222-222222222222', 'user2@test.com', 'hashed_password_2', 'User Two'),
('33333333-3333-3333-3333-333333333333', 'user3@test.com', 'hashed_password_3', 'User Three');

-- =========================
-- sessions
-- =========================
INSERT INTO sessions (id, user_id, token, expires_at) VALUES
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'token_user1', NOW() + INTERVAL '7 days'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'token_user2', NOW() + INTERVAL '7 days');

-- =========================
-- rooms
-- =========================
INSERT INTO rooms (room_id, user_id1, user_id2) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333');