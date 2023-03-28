create table users (
    id serial primary key,
    username varchar(255) not null unique,
    password varchar(255) not null,
    rating number: 0,
    is_admin boolean,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp
);