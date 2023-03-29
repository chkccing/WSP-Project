alter table users
add column username not null;
alter table users
add unique (username);
alter table users
add column showedName varchar(20) not null;
alter table users
add column avatar varchar(250);
alter table users
add column bio varchar(255);
alter table users
add column email varchar(60) not null;
alter table users
add column phone DECIMAL(8, 0) not null;
alter table users
alter column password_hash not null;
alter table users
add column is_age18 boolean not null;