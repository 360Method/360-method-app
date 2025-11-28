-- ============================================
-- DEVELOPMENT ONLY: Allow anonymous access for testing
-- REMOVE THESE POLICIES BEFORE PRODUCTION!
-- ============================================

-- Allow anyone to read properties (for testing without auth)
CREATE POLICY "DEV: Allow anonymous read on properties"
  ON properties
  FOR SELECT
  USING (true);

-- Allow anyone to insert properties (for testing without auth)
CREATE POLICY "DEV: Allow anonymous insert on properties"
  ON properties
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update properties (for testing without auth)
CREATE POLICY "DEV: Allow anonymous update on properties"
  ON properties
  FOR UPDATE
  USING (true);

-- Allow anyone to delete properties (for testing without auth)
CREATE POLICY "DEV: Allow anonymous delete on properties"
  ON properties
  FOR DELETE
  USING (true);

-- Same for system_baselines
CREATE POLICY "DEV: Allow anonymous read on system_baselines"
  ON system_baselines FOR SELECT USING (true);
CREATE POLICY "DEV: Allow anonymous insert on system_baselines"
  ON system_baselines FOR INSERT WITH CHECK (true);
CREATE POLICY "DEV: Allow anonymous update on system_baselines"
  ON system_baselines FOR UPDATE USING (true);
CREATE POLICY "DEV: Allow anonymous delete on system_baselines"
  ON system_baselines FOR DELETE USING (true);

-- Same for maintenance_tasks
CREATE POLICY "DEV: Allow anonymous read on maintenance_tasks"
  ON maintenance_tasks FOR SELECT USING (true);
CREATE POLICY "DEV: Allow anonymous insert on maintenance_tasks"
  ON maintenance_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "DEV: Allow anonymous update on maintenance_tasks"
  ON maintenance_tasks FOR UPDATE USING (true);
CREATE POLICY "DEV: Allow anonymous delete on maintenance_tasks"
  ON maintenance_tasks FOR DELETE USING (true);

-- Same for inspections
CREATE POLICY "DEV: Allow anonymous read on inspections"
  ON inspections FOR SELECT USING (true);
CREATE POLICY "DEV: Allow anonymous insert on inspections"
  ON inspections FOR INSERT WITH CHECK (true);
CREATE POLICY "DEV: Allow anonymous update on inspections"
  ON inspections FOR UPDATE USING (true);
CREATE POLICY "DEV: Allow anonymous delete on inspections"
  ON inspections FOR DELETE USING (true);

-- Same for upgrades
CREATE POLICY "DEV: Allow anonymous read on upgrades"
  ON upgrades FOR SELECT USING (true);
CREATE POLICY "DEV: Allow anonymous insert on upgrades"
  ON upgrades FOR INSERT WITH CHECK (true);
CREATE POLICY "DEV: Allow anonymous update on upgrades"
  ON upgrades FOR UPDATE USING (true);
CREATE POLICY "DEV: Allow anonymous delete on upgrades"
  ON upgrades FOR DELETE USING (true);

-- Same for cart_items
CREATE POLICY "DEV: Allow anonymous read on cart_items"
  ON cart_items FOR SELECT USING (true);
CREATE POLICY "DEV: Allow anonymous insert on cart_items"
  ON cart_items FOR INSERT WITH CHECK (true);
CREATE POLICY "DEV: Allow anonymous update on cart_items"
  ON cart_items FOR UPDATE USING (true);
CREATE POLICY "DEV: Allow anonymous delete on cart_items"
  ON cart_items FOR DELETE USING (true);
