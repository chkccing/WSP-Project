import express, { Router } from 'express'
import formidable from 'formidable'
import { mkdirSync } from 'fs'
import { unlink } from 'fs/promises'
import { join } from 'path'
import socketIO from 'socket.io'
import { client } from '../db'
import { checkString, HttpError } from '../express'
import { getSessionUser, hasLogin } from '../guards'
let uploadDir = join('uploads', 'event-images')
mkdirSync(uploadDir, { recursive: true })

eventRoutes.use('/uploads/event-images', express.static(uploadDir))

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

export function createEventRoutes(io: socketIO.Server) {
  let eventRoutes = Router()

  eventRoutes.use('/uploads/event-pictures', express.static(uploadDir))

  eventRoutes.get('/event', async (req, res, next) => {
    try {
      let result = await client.query(
        /* sql */ `
      select
        id
      , content
      , user_id
      , image
      from events
    `,
        [],
      )
      let events = result.rows
      res.json({ events })
    } catch (error) {
      next(error)
    }
  })

  eventRoutes.post('/events', hasLogin, (req, res, next) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        next(err)
        return
      }
      try {
        let content = checkString('content', fields.content)
        let imageMaybeArray = files.image
        let image = Array.isArray(imageMaybeArray)
          ? imageMaybeArray[0]
          : imageMaybeArray
        let user_id = getSessionUser(req).id
        let filename = image?.newFilename

        console.log('insert events:', { content, user_id, filename })

        let result = await client.query(
          /* sql */ `
        insert into events
        (content, user_id, image)
        values
        ($1, $2, $3)
        returning id
      `,
          [content, user_id, filename],
        )
        let id = result.rows[0].id

        res.json({ id })

        let event: Event = {
          id,
          content,
          user_id,
          image: filename,
        }
        io.emit('new-event', event)
      } catch (error) {
        next(error)
      }
    })
  })

  eventRoutes.delete('/events/:id', hasLogin, async (req, res, next) => {
    try {
      let id = +req.params.id
      let user_id = getSessionUser(req).id

      let result = await client.query(
        /* sql */ `
      select
        user_id
      , image
      from events
      where id = $1
    `,
        [id],
      )
      let event = result.rows[0]

      if (!event) {
        res.json({ details: 'the event is already deleted' })
        return
      }

      if (event.user_id !== user_id) {
        throw new HttpError(
          403,
          "You are not allowed to delete other users's event",
        )
      }

      if (event.image) {
        try {
          await unlink(join(uploadDir, event.image))
        } catch (error) {
        }
      }

      result = await client.query(
        /* sql */ `
      delete from events
      where id = $1
        and user_id = $2
    `,
        [id, user_id],
      )

      if (result.rowCount > 0) {
        res.json({ details: 'the event is just deleted' })
      } else {
        res.json({ details: 'the event is already deleted' })
      }
    } catch (error) {
      next(error)
    }
  })

  return eventRoutes
}
