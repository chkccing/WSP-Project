-- alter table users add column password_hash char(60);
-- update table users
-- set password_hash = ??
-- ;
-- alter table users drop column password;
-- alter table users alter column password_hash set not null;
alter TABLE users
add column is_age18 varchar(20) not null;
alter table users
add column password_hash char(60);
alter table event
add column decodeTag varchar(250) not null;