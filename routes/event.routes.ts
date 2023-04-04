import express from 'express'
// import fs from 'fs'
import { Router } from 'express'
import { Request, Response } from 'express'
import formidable from 'formidable'
import { mkdirSync } from 'fs'
// import { unlink } from 'fs/promises'
import { join } from 'path'
import { client } from '../db'
import { checkString, checkBoolean } from '../express'
import { HttpError } from '../express'
import { getSessionUser } from '../guards'
import { hasLogin } from '../guards'
let uploadDir = join('uploads', 'event-images')
mkdirSync(uploadDir, { recursive: true })
import '../session'
// import { log } from 'console'



export const eventRoutes = Router()

export type Event = {
  id: number
  host_id: number
  eventPicture?: string
  title: string
  category: string
  Date: Date
  Time: TimeRanges
  Details: String
  Hashtag: String
  Cost: Number
  Location: String
  Participants: Number
  FAQ: String
  Is_age18: Boolean
  Is_private: Boolean
}

// const uploadDir = "uploads/event-images";
// fs.mkdirSync(uploadDir, { recursive: true });

const form = formidable({
  uploadDir,
  keepExtensions: true,
  maxFiles: 1,
  maxFileSize: (1024 ** 2) * 200, // the default limit is 200KB
  filter: (part) => part.mimetype?.startsWith("image/") || false,
});

// When #contact-form submit, this route will receive the request
eventRoutes.post("/createEvent", function (req: Request, res: Response) {
  form.parse(req, async (err, fields, files) => {
    try {
      let host_id = getSessionUser(req).id
      let eventPictureMaybeArray = files.eventPictures
      console.log("eventPictureMaybeArray:", files)
      let eventPicture = Array.isArray(eventPictureMaybeArray)
        ? eventPictureMaybeArray[0]
        : eventPictureMaybeArray.newFilename
      let title = checkString('title', fields.title)
      let category = checkString('category', fields.category)
      let start_date = checkString('start_date', fields.start_date)
      let end_date = checkString('end_date', fields.end_date)
      let hashtag = checkString('hashtag', fields.hashtag)
      let cost = Number(checkString('cost', fields.cost))
      let location = checkString('location', fields.location)
      let participants = Number(checkString('participants', fields.participants))
      console.log({ participants });

      let FAQ = checkString('FAQ', fields.FAQ)
      let is_age18 = checkBoolean('is_age18', fields.is_age18)
      let is_private = checkBoolean('is_private', fields.is_private)

      let result = await client.query(
            /* sql */ `
      select
        event.id
      from event
      inner join users on users.id = event.host_id
          `,
        [],
      )

      result = await client.query(
            /* sql */ `
      insert into event
      (host_id, eventPicture, title, category, hashtag, start_date, end_date, cost, location, participants, FAQ, is_age18, is_private)
      values
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      returning id
          `,
        [host_id, eventPicture, title, category, hashtag, start_date, end_date, cost, location, participants, FAQ, is_age18, is_private],
      )

      let id = result.rows[0].id
      console.log(id);


      res.json(id);


    } catch (error) {
      console.log(error)
      res.json({})
    }
  })
});

eventRoutes.post("/joinEvent", async (req: Request, res: Response) => {
  try {
    let user_id = getSessionUser(req).id
    let event_id = req.query.eventId
    let result = await client.query(
            /* sql */ `
      select
      event_participant.id, event_participant.event_id
      from event_participant
      inner join users on users.id = event_participant.user_id
      inner join event on event.id = event_participant.event_id
          `,
      [],
    )
    result = await client.query(
            /* sql */ `
      insert into event_participant
      (user_id, event_id)
      values
      ($1, $2)
      returning id
          `,
      [user_id, event_id],
    )



    let id = result.rows[0].id
    console.log(id);


    res.json(id);


  } catch (error) {
    console.log(error)
    res.json({})
  }
});


eventRoutes.use('/uploads/event-images', express.static(uploadDir))


eventRoutes.get("/viewEvent/:id", async (req, res, next) => {
  // let id=req.query.id
  let id = req.params.id
  try {
    let result = await client.query(
    /* sql */`
    select * from event 
    left join event_participant on event_participant.event_id  = event.id
    WHERE event.id = $1
      `, [id]
    );

    res.json({ data: result.rows[0], joined: result.rowCount });

  }
  catch (error) {
    console.log(error)
    next(error)
  }
}
)

eventRoutes.get("/allParticipants/:id", async (req, res, next) => {
  let id = req.params.id
  try {
    let result = await client.query(
    /* sql */`
    select * from users
    right join event_participant on users.id  = event_participant.user_id 
    WHERE event_participant.event_id = $1
      `, [id],);
    let users = result.rows
    res.json({ users })
  } catch (error) {
    next(error)
  }
}
)


eventRoutes.get("/allEvent/", async (req, res, next) => {
  try {
    let result = await client.query(
    /* sql */`
    select id, eventPicture, title from event 
      `, [],);
    let events = result.rows
    res.json({ events })
  } catch (error) {
    next(error)
  }
}
)

eventRoutes.delete('/events/:id', hasLogin, async (req, res, next) => {
  try {
    let id = +req.params.id
    let user_id = getSessionUser(req).id

    let result = await client.query(
      /* sql */ `
    select
      host_id
    from events
    where id = $1
  `,
      [id],
    )
    let event = result.rows[0]

    if (!event) {
      res.json({ details: 'the memo is already deleted' })
      return
    }

    if (event.host_id !== user_id) {
      throw new HttpError(
        403,
        "You are not allowed to delete other users's memo",
      )
    }

    result = await client.query(
      /* sql */ `
    delete from events
    where id = $1
    and host_id = $2
  `,
      [id, user_id],
    )

    if (result.rowCount > 0) {
      res.json({ details: 'the memo is just deleted' })
    } else {
      res.json({ details: 'the memo is already deleted' })
    }
  } catch (error) {
    next(error)
  }
})