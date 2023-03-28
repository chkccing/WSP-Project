import { Request, Router } from 'express'
import { client } from '../db'
import { getString, getPhone, HttpError } from '../express'
import '../session'

export let userRoutes = Router()

export type User = {
  id: number
  username: string
  showedName: string
  avatar?: string
  rating: number
  bio: string
  email: string
  phone: number
  password: string
  is_age18: boolean
  is_admin: boolean
  created_at: Date
  updated_at: Date
}

userRoutes.get('/users', async (req, res, next) => {
  try {
    let result = await client.query(/* sql */ `
select
  id
, username
from users
`)
    let users = result.rows
    res.json({ users })
  } catch (error) {
    next(error)
  }
})

userRoutes.post('/users', async (req, res, next) => {
  try {
    let username = getString(req, 'username')
    let showedName = getString(req, 'showedName')
    let password = getString(req, 'password')
    let email = getString(req, 'email')
    let phone = getPhone(req, 12345678)
    let is_age18 = req.body.is_age18

    let result = await client.query(
      /* sql */ `
select
  id
from users
where username = $1
    `,
      [username],
    )
    let user = result.rows[0]

    if (user) {
      throw new HttpError(409, 'this username is already in use')
    }

    result = await client.query(
      /* sql */ `
insert into users
(username, showedName, password, email, phone, is_age18)
values
($1, $2)
returning id
    `,
      [username, showedName, password, email, phone, is_age18],
    )
    let id = result.rows[0].id

    res.json({
      id,
    })
  } catch (error) {
    next(error)
  }
})

userRoutes.post('/login', async (req, res, next) => {
  try {
    let username = getString(req, 'username')
    let password = getString(req, 'password')

    let result = await client.query(
      /* sql */ `
select
  id
, password
from users
where username = $1
    `,
      [username],
    )
    let user = result.rows[0]

    if (!user) {
      throw new HttpError(403, 'wrong username')
    }

    if (user.password !== password) {
      throw new HttpError(403, 'wrong username or password')
    }

    req.session.user = {
      id: user.id,
      username,
    }

    res.json({ id: user.id })
  } catch (error) {
    next(error)
  }
})

userRoutes.get('/role', (req, res) => {
  res.json({
    user: req.session.user,
  })
})
