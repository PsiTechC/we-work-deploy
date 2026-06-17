-- initial schema (optional, Prisma also manages schema)
CREATE TABLE IF NOT EXISTS "Site" (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "User" (
  id serial PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text,
  role text NOT NULL,
  "createdAt" timestamp with time zone DEFAULT now()
);
