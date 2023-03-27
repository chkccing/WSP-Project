import express, { Router } from 'express'
import formidable from 'formidable'
import { mkdirSync } from 'fs'
import { join } from 'path'
import { checkString, HttpError } from '../express'
import { getSessionUser, hasLogin } from '../guards'

export let eventRoutes = Router()

let uploadDir = join('uploads', 'memo-images')
mkdirSync(uploadDir, { recursive: true })

eventRoutes.use('/uploads/memo-images', express.static(uploadDir))

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

let events: Event[] = [
  { id: 1, host_id: 1, eventPicture?: 'null', title: 'testing', category: 'event', date: 2023-01-01, time: 2300-2400, details: '', hashtag: '#testing', cost: 0, Location: 'Hong Kong', participants: 2, FAQ: 'Internal Test only.', is_age18: false, is_private: false,},
]
let maxId = events.reduce((id, item) => Math.max(id, item.id), 0)

EventRoutes.get('/events', (req, res) => {
  res.json(events)
})

EventRoutes.post('/events', hasLogin, (req, res, next) => {
  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err)
      return
    }
    try {
      let host_id = getSessionUser(req).id
      let imageMaybeArray = files.eventPicture
      let eventPicture = Array.isArray(imageMaybeArray)
        ? imageMaybeArray[0]
        : imageMaybeArray
      let title = checkString('title', fields.title)
      let category = checkString('category', fields.category)
      let details = checkString('details', fields.details)
      let hashtag = checkString('hashtag', fields.hashtag)
      let date = req.body.date
      let time = req.body.time
      let cost = req.body.cost
      let location = checkString('location', fields.location)
      let participants = req.body.is_private
      let FAQ = checkString('title', fields.title)
      let is_age18 = req.body.is_age18
      let is_private = req.body.is_private
      

      maxId++
      events.push({
        id: maxId,
        host_id,
        eventPicture?: eventPicture?.newFilename,
        title,
        category,
        date,
        time,
        details,
        hashtag,
        cost,
        location,
        participants,
        FAQ,
        is_age18,
        is_private,
      })
      res.json({ id: maxId })
    } catch (error) {
      next(error)
    }
  })
})

EventRoutes.delete('/events/:id', hasLogin, (req, res) => {
  let id = +req.params.id

  let idx = events.findIndex(event => event.id === id)

  if (idx === -1) {
    res.json({ details: 'the event is already deleted' })
    return
  }

  let event = events[idx]
  if (event.host_id !== getSessionUser(req).id) {
    throw new HttpError(403, "You are not allowed to delete other users' event")
  }

  events.splice(idx, 1)
  res.json({ details: 'the event is just deleted' })
})
