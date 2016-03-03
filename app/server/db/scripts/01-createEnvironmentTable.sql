CREATE TABLE environments (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL,
  cloned_from INTEGER REFERENCES environments (id) DEFAULT NULL,
  inherits INTEGER REFERENCES environments (id) DEFAULT NULL,
  creation_user text NOT NULL,
  creation_time timestamp DEFAULT now()
);