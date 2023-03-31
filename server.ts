import express, { NextFunction, Request, Response } from 'express'
import { print } from 'listening-on'
import { eventRoutes } from './routes/event.routes'
import { userRoutes } from './routes/user.routes'
import { sessionMiddleware } from './session'

let app = express()

app.use(express.static('public'))

  
  app.use(express.urlencoded())
  app.use(express.json())
  
  app.use(sessionMiddleware)
  
  app.use(userRoutes)
  app.use(eventRoutes)
  
  app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    if ('statusCode' in error) {
      res.status(error.statusCode)
    } else {
      res.status(500)
    }
    let message = String(error)
    message = message.replace(/\w+: /, '')
    res.json({
      error: message,
    })
  })
  
  app.use((req, res, next) => {
    res.status(404)
    res.json({ error: 'Route not found' })
  })
  
  let port = 8100
  app.listen(port, () => {
    print(port)
  })
