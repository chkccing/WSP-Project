create table event_rating (
    id serial primary key,
    event_id integer not null REFERENCES event(id),
    user_id integer not null REFERENCES users(id),
    rating DECIMAL(1, 0) not null,
    comment varchar(250),
    created_at timestamp not null default current_timestamp
);