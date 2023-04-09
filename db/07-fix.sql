-- 1: link event.host_id fk to user.id
ALTER TABLE event
ADD CONSTRAINT event_host_fk FOREIGN KEY (host_id) REFERENCES users (id);
-- 2: setup fk in event_participant (user and event)
ALTER TABLE event_participant
ADD CONSTRAINT participant_event_fk FOREIGN KEY (event_id) REFERENCES event (id);
ALTER TABLE event_participant
ADD CONSTRAINT participant_user_fk FOREIGN KEY (user_id) REFERENCES users (id);
-- 6: update hashtag usage
drop table post_tag;
drop table post;
CREATE TABLE event_tag (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES event(id),
    tag_id INTEGER REFERENCES tag(id)
);
-- 7: remove unused image, it is inline in event table now
drop table image;