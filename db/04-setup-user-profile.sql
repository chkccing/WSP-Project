alter table users rename column username to email;

alter table users alter column email drop not null;

alter table users add column username varchar(255);

alter table users add unique (username);

alter table users add column nickname varchar(255);

alter table users add column avatar varchar(255);

alter table users add column locale varchar(5);

alter table users alter column password_hash drop not null;
