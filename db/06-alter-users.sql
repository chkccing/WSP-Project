alter table users
add column password_hash char(60);
--
update table users
set password_hash = ? ?;
--
alter table users drop column password;
--
alter table users
alter column password_hash
set not null;
alter TABLE users
add column is_age18 varchar(20) not null;
-- drop table eventt CASCADE; 筆記用
INSERT INTO tag (id, hashtag, tag_group_id)
VALUES (1, 'apple', 1);