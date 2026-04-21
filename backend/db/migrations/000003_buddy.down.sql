DROP INDEX IF EXISTS idx_friend_relationships_user2;
DROP INDEX IF EXISTS idx_friend_relationships_user1;
DROP TABLE IF EXISTS friend_relationships;

DROP INDEX IF EXISTS idx_buddy_relationships_ends_at;
DROP INDEX IF EXISTS idx_buddy_relationships_user2;
DROP INDEX IF EXISTS idx_buddy_relationships_user1;
DROP TABLE IF EXISTS buddy_relationships;

DROP TABLE IF EXISTS matching_queue;

DROP TRIGGER IF EXISTS trigger_buddy_profiles_updated_at ON buddy_profiles;
DROP TABLE IF EXISTS buddy_profiles;

ALTER TABLE action_items
    DROP CONSTRAINT IF EXISTS fk_action_items_user_id;
