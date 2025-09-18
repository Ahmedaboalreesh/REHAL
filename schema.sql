-- Ensure required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email citext UNIQUE NOT NULL,
  phone text UNIQUE NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('student', 'worker')),
  district text NOT NULL,
  affiliation text NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Extensions required (in Supabase they usually exist). If not, run:
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- CREATE EXTENSION IF NOT EXISTS citext;

CREATE INDEX IF NOT EXISTS users_email_idx ON public.users (email);
CREATE INDEX IF NOT EXISTS users_phone_idx ON public.users (phone);

-- Owners (bus owners) table
CREATE TABLE IF NOT EXISTS public.owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_name text NOT NULL,
  company text,
  email citext UNIQUE NOT NULL,
  phone text UNIQUE NOT NULL,
  plate_number text NOT NULL,
  capacity int NOT NULL CHECK (capacity >= 4 AND capacity <= 20),
  license_number text NOT NULL,
  license_expiry date NOT NULL,
  password_hash text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS owners_email_idx ON public.owners (email);
CREATE INDEX IF NOT EXISTS owners_phone_idx ON public.owners (phone);

