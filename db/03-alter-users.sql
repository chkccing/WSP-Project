alter table users add column password_hash char(60);

update table users
set password_hash = ??
;

alter table users drop column password;

alter table users alter column password_hash set not null;
