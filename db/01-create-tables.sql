create table "users" (
    id serial primary key,
    username varchar(20) not null unique,
    password varchar(30) not null,
    rating DECIMAL(1, 0),
    is_admin boolean,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp
);
create table event (
    id serial primary key,
    host_id integer not null,
    eventPicture varchar(250),
    title varchar(100) not null,
    category varchar(250) not null,
    hashtag varchar(250) not null,
    start_date date not null,
    end_date date not null,
    cost integer not null,
    location varchar(20) not null,
    Participants integer not null,
    FAQ varchar(500) not null,
    is_age18 boolean not null,
    is_private boolean not null,
    active boolean not null default true,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp
);
create table event_participant (
    id serial primary key,
    event_id integer not null,
    user_id integer not null,
    active boolean not null default true
);
-- create table event_timeslot (
--     id serial primary key,
--     date date,
--     timeslot time
-- );
-- create table hashtag (
--     id serial primary key,
--     event_id integer,
-- );
-- 使用chatGPT翻譯Beeno的hashtage code
-- CREATE TABLE post (id SERIAL PRIMARY KEY, content TEXT);
-- tag_group用唔着，commented。
-- CREATE TABLE tag_group (id SERIAL PRIMARY KEY, name TEXT UNIQUE);
-- CREATE TABLE tag (
--     id SERIAL PRIMARY KEY,
--     hashtag TEXT UNIQUE,
--     tag_group_id INTEGER REFERENCES tag_group(id)
-- );
-- CREATE TABLE post_tag (
--     id SERIAL PRIMARY KEY,
--     post_id INTEGER REFERENCES post(id),
--     tag_id INTEGER REFERENCES tag(id)
-- );