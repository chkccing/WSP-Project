import express from 'express'
// import { Router } from 'express'
import formidable from 'formidable'
import { mkdirSync } from 'fs'
// import { unlink } from 'fs/promises'
import { join } from 'path'
// import { client } from '../db'
import { checkString, HttpError } from '../express'
import { getSessionUser, hasLogin } from '../guards'
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

type Event = {
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

let events: Event[] = []
let maxId = events.reduce((id, item) => Math.max(id, item.id), 0)

eventRoutes.get('/events', (req, res) => {
  res.json(events)
})

eventRoutes.post('/events', hasLogin, (req, res, next) => {
  form.parse(req, (err, fields, files) => {
    // console.log({ err, fields, files })
    if (err) {
      next(err)
      return
    }
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
      let Details = checkString('Details', fields.content)
      let Hashtag = checkString('Hashtag', fields.content)
      let Cost = req.body['Cost']
      let Location = checkString('Location', fields.content)
      let Participants = req.body['Participants']
      let FAQ = checkString('FAQ', fields.content)
      let Is_age18 = req.body['Is_age18']
      let Is_private = req.body['Is_private']
      maxId++
      events.push({
        id: maxId,
        host_id,
        eventPicture: eventPicture?.newFilename,
        title,
        category,
        Date,
        Time,
        Details,
        Hashtag,
        Cost,
        Location,
        Participants,
        FAQ,
        Is_age18,
        Is_private,
      })
      res.json({ id: maxId })
    } catch (error) {
      next(error)
    }
  })
})

eventRoutes.delete('/events/:id', hasLogin, (req, res) => {
  let id = +req.params.id

  let idx = events.findIndex(event => event.id === id)

  if (idx === -1) {
    res.json({ details: 'the event is already deleted' })
    return
  }

  let event = events[idx]
  if (event.host_id !== getSessionUser(req).id) {
    throw new HttpError(403, "You are not allowed to delete other users's events=")
  }

  events.splice(idx, 1)
  res.json({ details: 'the event is just deleted' })
})
