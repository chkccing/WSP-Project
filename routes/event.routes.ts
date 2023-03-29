import express from 'express'
// import { Router } from 'express'
import formidable from 'formidable'
import { mkdirSync } from 'fs'
// import { unlink } from 'fs/promises'
import { join } from 'path'
import { client } from '../db'
import { checkString } from '../express'
// import { HttpError } from '../express'
import { getSessionUser } from '../guards'
// import { hasLogin } from '../guards'
let uploadDir = join('uploads', 'event-images')
mkdirSync(uploadDir, { recursive: true })

// appp.use('/uploads/event-images', express.static(uploadDir))

export const eventRoutes = express.Router()

let form = formidable({
  uploadDir,
  keepExtensions: true,
  maxFileSize: 1024 * 1024 * 2,
  filter: part => {
    console.log('filter part:', part)
    return part.mimetype?.startsWith('image/') || false
  },
})

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


eventRoutes.post('/createEvent', async (req, res, next) => {
  form.parse(req, async (err, fields, files) => {
  try {
    let host_id = getSessionUser(req).id
    let eventPictureMaybeArray = files.image
    let eventPicture = Array.isArray(eventPictureMaybeArray)
      ? eventPictureMaybeArray[0]
      : eventPictureMaybeArray
    let title = checkString('title', fields.content)
    let category = checkString('content', fields.content)
    let Date = req.body['Date']
    let Time = req.body['Time']
    let Hashtag = checkString('Hashtag', fields.content)
    let Cost = req.body['Cost']
    let Location = checkString('Location', fields.content)
    let Participants = req.body['Participants']
    let FAQ = checkString('FAQ', fields.content)
    let Is_age18 = req.body['Is_age18']
    let Is_private = req.body['Is_private']

    let result = await client.query(
      /* sql */ `
select
  id
from event
where host_id = $1
    `,
      [host_id],
    )
    
    result = await client.query(
      /* sql */ `
insert into events
(host_id, eventPicture, title, category, Date, Time, Hashtag, Cost, Location, Participants, FAQ, Is_age18, Is_private)
values
($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
returning id
    `,
      [host_id, eventPicture, title, category, Date, Time, Hashtag, Cost, Location, Participants, FAQ, Is_age18, Is_private],
    )
    let id = result.rows[0].id

    res.json({
      id,
    })
  } catch (error) {
    next(error)
  }
})
})
