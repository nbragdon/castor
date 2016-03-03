CREATE TABLE contexts (
  id serial PRIMARY KEY,
  name text NOT NULL,
  parent integer,
  creation_user text NOT NULL,
  creation_time timestamp DEFAULT now(),
  UNIQUE(name, parent)
);