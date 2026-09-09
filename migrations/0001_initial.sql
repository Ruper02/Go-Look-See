CREATE TABLE IF NOT EXISTS inspections (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('draft', 'completed')),
  area_id TEXT NOT NULL DEFAULT '',
  area_name TEXT NOT NULL DEFAULT '',
  inspection_date TEXT NOT NULL DEFAULT '',
  inspector TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  shift TEXT NOT NULL DEFAULT '',
  general_notes TEXT NOT NULL DEFAULT '',
  data_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inspections_updated_at ON inspections (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON inspections (status);

CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY,
  inspection_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  object_key TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL DEFAULT '',
  content_type TEXT NOT NULL DEFAULT 'image/jpeg',
  size_bytes INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  FOREIGN KEY (inspection_id) REFERENCES inspections (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_photos_inspection_id ON photos (inspection_id);
