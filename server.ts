import express, { NextFunction, Request, Response } from 'express'
import { print } from 'listening-on'
import { eventRoutes } from './routes/event.routes'
import { userRoutes } from './routes/user.routes'
import { sessionMiddleware } from './session'

let app = express()

app.use(express.static('public'))

let urlencoded = (req: Request, res: Response, next: NextFunction) => {
    let type = req.headers['content-type']
    if (type !== 'application/x-www-form-urlencoded') {
      next()
      return
    }
    req.on('data', data => {
      let str = data.toString()
      let body = new URLSearchParams(str)
      req.body = {}
      for (let [key, value] of body.entries()) {
        console.log({ key, value })
        req.body[key] = value
      }
      next()
    })
  }
  
  let json = (req: Request, res: Response, next: NextFunction) => {
    let type = req.headers['content-type']
    if (type !== 'application/json') {
      next()
      return
    }
    req.on('data', data => {
      let str = data.toString()
      req.body = JSON.parse(str)
      next()
    })
  }
  
  app.use(urlencoded)
  app.use(json)
  
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
