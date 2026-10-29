-- QuoteLocal NC schema. Local D1 / SQLite.

CREATE TABLE contractors (
  id TEXT PRIMARY KEY,
  contact_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  zip TEXT NOT NULL,
  service_radius_miles REAL NOT NULL CHECK (service_radius_miles > 0 AND service_radius_miles <= 200),
  rating REAL NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  source TEXT NOT NULL CHECK (source IN ('seed', 'signup')),
  created_at TEXT NOT NULL
);

CREATE TABLE contractor_categories (
  contractor_id TEXT NOT NULL REFERENCES contractors(id),
  category TEXT NOT NULL,
  PRIMARY KEY (contractor_id, category)
);

CREATE INDEX idx_contractor_categories_category ON contractor_categories(category);

CREATE TABLE quote_requests (
  id TEXT PRIMARY KEY,
  homeowner_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  zip TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'notified')),
  verification_token_hash TEXT NOT NULL UNIQUE,
  photo_access_token TEXT NOT NULL,
  created_at TEXT NOT NULL,
  verified_at TEXT,
  submitter_ip TEXT
);

CREATE TABLE quote_photos (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES quote_requests(id),
  r2_key TEXT NOT NULL,
  content_type TEXT NOT NULL,
  byte_size INTEGER NOT NULL,
  original_name TEXT NOT NULL
);

CREATE INDEX idx_quote_photos_request ON quote_photos(request_id);

CREATE TABLE quote_notifications (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES quote_requests(id),
  contractor_id TEXT NOT NULL REFERENCES contractors(id),
  score REAL NOT NULL,
  distance_miles REAL NOT NULL,
  rating_component REAL NOT NULL,
  volume_component REAL NOT NULL,
  proximity_component REAL NOT NULL,
  sent_at TEXT NOT NULL,
  UNIQUE (request_id, contractor_id)
);

CREATE TABLE rate_limit_buckets (
  bucket_key TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL,
  PRIMARY KEY (bucket_key, window_start)
);

CREATE TABLE email_outbox (
  id TEXT PRIMARY KEY,
  to_address TEXT NOT NULL,
  reply_to TEXT,
  subject TEXT NOT NULL,
  html TEXT NOT NULL,
  text_body TEXT NOT NULL,
  kind TEXT NOT NULL,
  request_id TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_email_outbox_created ON email_outbox(created_at);
