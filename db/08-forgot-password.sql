ALTER TABLE users
add column token text null --
alter table users
add column token_expire_at timestamp null --
alter table users
add column token_attempt integer null