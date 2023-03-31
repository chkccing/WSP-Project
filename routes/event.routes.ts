import express from 'express'
import fs from 'fs'
import { Router } from 'express'
import { Request, Response } from 'express'
import formidable from 'formidable'
// import { mkdirSync } from 'fs'
// import { unlink } from 'fs/promises'
// import { join } from 'path'
import { client } from '../db'  
import { checkString, checkBoolean } from '../express'
// import { HttpError } from '../express'
import { getSessionUser } from '../guards'
// import { hasLogin } from '../guards'
// let uploadDir = join('uploads', 'event-images')
// mkdirSync(uploadDir, { recursive: true })
import '../session'

// app.use('/uploads/event-images', express.static(uploadDir))

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

const uploadDir = "uploads";
fs.mkdirSync(uploadDir, { recursive: true });

const form = formidable({
  uploadDir,
  keepExtensions: true,
  maxFiles: 1,
  maxFileSize: (1024 ** 2) * 200, // the default limit is 200KB
  filter: (part) => part.mimetype?.startsWith("image/") || false,
});

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// When #contact-form submit, this route will receive the request
eventRoutes.post("/createEvent", function (req: Request, res: Response) {
  form.parse(req, async (err, fields, files) => {
    try {
          let host_id = getSessionUser(req).id
          let eventPictureMaybeArray = files.image
          let eventPicture = Array.isArray(eventPictureMaybeArray)
            ? eventPictureMaybeArray[0]
            : eventPictureMaybeArray
          let title = checkString('title', fields.title)
          let category = checkString('category', fields.category)
          let start_date = checkString('start_date', fields.start_date)
          let end_date = checkString('end_date', fields.end_date)
          let hashtag = checkString('hashtag', fields.hashtag)
          let cost = Number(checkString('cost', fields.cost))
          let location = checkString('location', fields.location)
          let participants = Number(checkString('participants', fields.participants))
          console.log({participants});
          
          let FAQ = checkString('FAQ', fields.FAQ)
          let is_age18= checkBoolean('is_age18', fields.is_age18)
          let is_private= checkBoolean('is_private', fields.is_private)
      
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
      
          res.json(id);

          
      res.json({ success: true });
    }catch (error) {
        console.log(error)
        res.json({})
      }})});


// eventRoutes.post('/createEvent', hasLogin, (req, res) => {
//   form.parse(req, async (err, fields, files) => {
//     console.log(fields);
    
//   if (err) {
//     console.log(err)
//     res.json({})
//   }
//   try {
//     let host_id = getSessionUser(req).id
//     let eventPictureMaybeArray = files.image
//     let eventPicture = Array.isArray(eventPictureMaybeArray)
//       ? eventPictureMaybeArray[0]
//       : eventPictureMaybeArray
//     let title = checkString('title', fields.title)
//     let category = checkString('category', fields.category)
//     let start_date = checkString('start_date', fields.start_date)
//     let end_date = checkString('end_date', fields.end_date)
//     let hashtag = checkString('hashtag', fields.hashtag)
//     let cost = Number(checkString('cost', fields.cost))
//     let location = checkString('location', fields.location)
//     let participants = Number(checkString('participants', fields.participants))
//     console.log({participants});
    
//     let FAQ = checkString('FAQ', fields.FAQ)
//     let is_age18= checkBoolean('is_age18', fields.is_age18)
//     let is_private= checkBoolean('is_private', fields.is_private)
//     let result = await client.query(
//       /* sql */ `
// select
//   event.id
// from event
// inner join users on users.id = event.host_id
//     `,
//       [],
//     )
    
//     result = await client.query(
//       /* sql */ `
// insert into event
// (host_id, eventPicture, title, category, hashtag, start_date, end_date, cost, location, participants, FAQ, is_age18, is_private)
// values
// ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
// returning id
//     `,
//       [host_id, eventPicture, title, category, hashtag, start_date, end_date, cost, location, participants, FAQ, is_age18, is_private],
//     )

//     let id = result.rows[0].id

//     res.json(id)
//   } catch (error) {
//     console.log(error)
//     res.json({})

//   }
// })
// })

// eventRoutes.get('/loadEvent', async (req, res, next) => {
//   try {let result = await client.query(
//  /* sql */`
//  select eventPicture, title, category, hashtag, start_date, end_date, cost, location, participants, FAQ, is_age18, is_private from event`
//  ,
//  [],
// )
//   let events = result.rows
//   res.json({ events }) 
// }catch (error) {
//   console.log(error)
//   res.json({})
// }})