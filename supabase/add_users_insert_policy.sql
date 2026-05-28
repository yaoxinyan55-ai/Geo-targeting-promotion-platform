-- 允许已认证用户在 users 表中创建自己的记录
CREATE POLICY "users_insert_own" ON users FOR INSERT
  WITH CHECK (id = auth.uid());
