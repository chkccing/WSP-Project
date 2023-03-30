// import express from 'express'
import { Router } from 'express'
import formidable from 'formidable'
import { mkdirSync } from 'fs'
// import { unlink } from 'fs/promises'
import { join } from 'path'
import { client } from '../db'  
import { checkString, checkBoolean } from '../express'
// import { HttpError } from '../express'
import { getSessionUser, hasLogin } from '../guards'
let uploadDir = join('uploads', 'event-images')
mkdirSync(uploadDir, { recursive: true })
import '../session'

// appp.use('/uploads/event-images', express.static(uploadDir))

export const eventRoutes = Router()

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


eventRoutes.post('/createEvent', hasLogin, (req, res) => {
  form.parse(req, async (err, fields, files) => {
    console.log(fields);
    
  if (err) {
    console.log(err)
    res.json({})
  }
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

    res.json({ id })    
  } catch (error) {
    console.log(error)
    res.json({})
  }
})
})
