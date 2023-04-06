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
// import { HttpError } from '../express'
import { getSessionUser } from '../guards'
// import { hasLogin } from '../guards'
let uploadDir = join('uploads', 'event-images')
mkdirSync(uploadDir, { recursive: true })
import '../session'



export const eventRoutes = Router()

export type Event = {
  id: number
  host_id: number
  eventPicture?: string
  title: string
  category: string
  date: Date
  time: TimeRanges
  details: String
  hashtag: String
  cost: Number
  location: String
  participants: Number
  faq: String
  is_age18: Boolean
  is_private: Boolean
}

// const uploadDir = "uploads/event-images";
// fs.mkdirSync(uploadDir, { recursive: true });

//Photo Uploads
const form = formidable({
  uploadDir,
  keepExtensions: true,
  maxFiles: 1,
  maxFileSize: (1024 ** 2) * 200, // the default limit is 200KB
  filter: (part) => part.mimetype?.startsWith("image/") || false,
});

// When #contact-form submit, this route will receive the request
//User Create Event
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
      let faq = checkString('faq', fields.faq)
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
      (host_id, eventPicture, title, category, hashtag, start_date, end_date, cost, location, participants, faq, is_age18, is_private)
      values
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      returning id
          `,
        [host_id, eventPicture, title, category, hashtag, start_date, end_date, cost, location, participants, faq, is_age18, is_private],
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

//Participants press the join button to join the event
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
    res.json(id);
  } catch (error) {
    if (getSessionUser(req).id == undefined) { console.log("Please Login") }
    res.json({})
  }
});

//User upload photos when creating events
eventRoutes.use('/uploads/event-images', express.static(uploadDir))

//Show Event's all details
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

//Show all participants name in single event page
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

//show user you have joined event or haven't joined event.
eventRoutes.get("/joinStatus/:id", async (req, res, next) => {
  let id = req.params.id
  try {
    let user_id = getSessionUser(req).id
    let result = await client.query(
    /* sql */`
    select * from event_participant
    left join users on users.id  = event_participant.user_id 
    WHERE event_participant.event_id = $1
    AND event_participant.user_id = $2
      `, [id, user_id]);

    if (result.rows.length === 0) {
      res.json({ hasJoin: false })
      console.log("You haven't joined this event.")
    } else {
      res.json({ hasJoin: true })
      console.log("You have joined this event.")
    }
  } catch (error) {
    res.json({ err: error })
    next(error)
  }
})


//show all event in index page
eventRoutes.get("/allEvent/", async (req, res, next) => {
  try {
    let result = await client.query(
    /* sql */`
    select id, eventPicture, title, end_date, is_private, active from event 
    WHERE event.active = true and event.end_date > NOW()
    ORDER BY start_date
      `, [],);
    let events = result.rows
    res.json({ events })
  } catch (error) {
    next(error)
  }
}
)

//organizer delete event
eventRoutes.post("/deleteEvent", async (req: Request, res: Response) => {
  try {
    let user_id = getSessionUser(req).id
    let event_id = req.query.eventId
    let result = await client.query(
            /* sql */ `
      select
      event.id, event.host_id, event.active
      from event
      WHERE event.host_id = ${user_id} and event.active = true
          `,
      [],
    )
    result = await client.query(
            /* sql */ `
      update event set active = false 
      WHERE id = $1
      returning id
          `,
      [event_id],
    )

    let id = result.rows[0].id
    res.json(id);
  } catch (error) {
    res.json({})
  }
});

//organizer delete participant
eventRoutes.post("/deleteParticipant", async (req: Request, res: Response) => {
  try {
    let user_id = getSessionUser(req).id
    let event_id = req.query.eventId
    let result = await client.query(
            /* sql */ `
      select
      event.id, event.host_id, event.active
      from event
      WHERE event.host_id = ${user_id} and event.active = true
          `,
      [],
    )
    result = await client.query(
            /* sql */ `
      update event set active = false 
      WHERE id = $1
      returning id
          `,
      [event_id],
    )

    let id = result.rows[0].id
    res.json(id);
  } catch (error) {
    res.json({})
  }
});


// eventRoutes.post("/eventSearch", async (req, res) => {
//   let search = req.body.search;
//   let query = req.body.query;
//   //console.log("search: ", search, "query", query);
//   let searchList = await client.query(
//     `
//     SELECT event.title
// FROM event
// INNER JOIN hashtag ON employee.id = claim.employee_id
// INNER JOIN department ON department.id = claim.department_id
// WHERE ${search} Like $1
// ORDER BY claim.id DESC;`,
//     [`%${query}%`]
//   );
//   //let dbEmployee = dbEmployeeList.rows[0];
//   //console.log(dbEmployee);
//   //console.log("searchList from db searched by query+search", searchList.rows);
//   res.json(searchList.rows);
// });