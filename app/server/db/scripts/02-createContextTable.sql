CREATE TABLE contexts (
  id serial PRIMARY KEY,
  name text NOT NULL,
  parent integer REFERENCES environments(id) NOT NULL,
  creation_user text NOT NULL,
  creation_time timestamp DEFAULT now(),
  UNIQUE(name, parent)
);