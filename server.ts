import express from 'express'
import { print } from 'listening-on'
import { eventRoutes } from './routes/event.routes'
import { userRoutes } from './routes/user.routes'

let app = express()

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(userRoutes)
app.use(eventRoutes)

let port = 8100
app.listen(port, () => {
 print(port)
})