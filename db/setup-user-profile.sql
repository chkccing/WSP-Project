alter table users
add column username drop not null;
alter table users
add unique (username);
alter table users
add column showedName varchar(20) drop not null;
alter table users
add column avatar url;
alter table users
add column bio varchar(255);
alter table users
add column email varchar(60) drop not null;
alter table users
add column phone varchar(8) drop not null;
alter table users
alter column password_hash drop not null;
alter table users
add column is_age18 boolean drop not null;