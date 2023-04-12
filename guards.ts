import { NextFunction, Request, Response } from 'express'
import { HttpError } from './express'
import './session'

export function hasLogin(req: Request, res: Response, next: NextFunction) {
  if (req.session.user) {
    next()
    return
  }
  res.status(401)
  res.json({ error: 'This API is only for authenticated users' })
}

export function getSessionUser(req: Request) {
  let user = req.session.user
  //僅用於測試用，hard code 一個用戶登入session。
  // if (!user) {
  //   req.session.user = { id: 2, avatar: "dev", name: "dev" };
  //   user = req.session.user;
  // }
  if (user) return user
  throw new HttpError(401, 'This API is only for authenticated users')
}
