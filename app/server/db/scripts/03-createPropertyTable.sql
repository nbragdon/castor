CREATE TABLE properties (
  id serial PRIMARY KEY,
  name text NOT NULL,
  parent integer REFERENCES contexts(id) NOT NULL,
  value text,
  type text DEFAULT 'string',
  version text DEFAULT '1.0',
  override_required BOOLEAN default false,
  description text,
  creation_user text NOT NULL,
  creation_time timestamp DEFAULT now(),
  UNIQUE (name, parent, version)
);