create table memos (
  id serial primary key
, content text not null
, image varchar(255)
, created_at timestamp not null default current_timestamp
, updated_at timestamp
);

create table users (
  id serial primary key
, username varchar(255) not null unique
, password varchar(255) not null
, created_at timestamp not null default current_timestamp
, updated_at timestamp
);

create table testtable (
  id serial primary key
, username varchar(255) not null unique
, password varchar(255) not null
);

