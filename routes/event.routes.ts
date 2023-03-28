import express, { Router } from 'express'
import formidable from 'formidable'
import { mkdirSync } from 'fs'
import { join } from 'path'
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