DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
DROP FUNCTION IF EXISTS update_updated_at();
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;
```

---

down の順番は依存関係の逆順です。
```
up   の順: users → sessions → 関数 → トリガー
down の順: トリガー → 関数 → sessions → users
