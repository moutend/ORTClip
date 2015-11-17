--- SQL for heroku-PostgreSQL

CREATE TABLE message_table (
  id        SERIAL    PRIMARY KEY,
  hash      text      NOT NULL,
  isUsing   boolean   NOT NULL,
  message   text      NOT NULL,
  timestamp timestamp NOT NULL
);
