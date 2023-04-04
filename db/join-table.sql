SELECT user.avatar as user_avatar,
    event.host_id as event_host_id,
    event.eventPicture as event_eventPicture,
    event_participant.event_timeslot_id as event_participant_event_timeslot_id,
    event_participant.user_id as event_participant_user_id,
    event_rating.event_id as event_rating_event_id,
    event_rating.user_id as event_rating_user_id,
    event_timeslot.date as event_timeslot_date,
    event_timeslot.timeslot as event_timeslot_timeslot hashtag.id as hashtag_id,
    event.id as event_id,
    event.eventPicture as event_eventPicture,
    event_participant.event_id as event_participant_event_id,
    FROM user
    join image on image.user_icon = user.avatar;
FROM event
    join user on user.id = event.host_id,
    join image on image.event_image = event.eventPicture;
FROM event_participant
    join event on event_id = event_participant.event_id,
    join event on event_timeslot_id = event_participant.event_timeslot_id,
    join user on user.id = event_participant.user_id;
FROM event_rating
    join event on event.id = event_rating.event_id,
    join user on user.id = event_rating.user_id;
FROM event_timeslot
    join event on event.date = event_timeslot.date,
    join event on event.time = event_timeslot.timeslot;
FROM hashtag
    join event on event.id = hashtag.event_id;