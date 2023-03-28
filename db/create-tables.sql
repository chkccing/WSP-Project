create table users (
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
    host_id integer,
    eventPicture url,
    title varchar(60) not null,
    category varchar(20) not null,
    hashtag varchar(20) not null,
    date date not null,
    time datetime not null,
    cost integer not null,
    location varchar(20) not null,
    Participants number not null,
    FAQ varchar(500),
    is_age18 boolean not null,
    is_private boolean not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp
);
create table event_participant (
    id serial primary key,
    event_id integer,
    user_id integer,
);
create table event_rating (
    id serial primary key,
    event_id integer,
    user_id integer,
    rating DECIMAL(1, 0),
    comment varchar(250),
    created_at datetime,
);
create table image (
    id serial primary key,
    event_image url,
    user_icon url,
) create event_timeslot (
    id serial primary key,
    period date,
    timeslot datetime,
)