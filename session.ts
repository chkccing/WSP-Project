import session from 'express-session'

export let sessionMiddleware = session({
  secret:
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60, // 1hr
  },
})

declare module 'express-session' {
  interface SessionData {
    user: {
      id: number
      username: string
      is_age18: boolean
    }
  }
}
