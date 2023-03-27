import { Router } from 'express'
import { getString, getPhone, HttpError } from '../express'
import '../session'

export let userRoutes = Router()

export type User ={
    id: number
    username: string
    showedName: string
    icon: string
    rating: number
    bio: string
    email: string
    phone: number
    password: string
    is_age18: boolean
    is_admin: boolean
}

let users: User[] = []
let maxId = users.reduce((id, user) => Math.max(id, user.id), 0) 

userRoutes.get('/users', (req, res) => {
    res.json(
        users.map(user => ({
        id: user.id,
        username: user.username,
    }))
    )
})

userRoutes.post('/users', (req, res) => {
    maxId++
    let username = getString(req, 'username')
    let showedName = getString(req, 'showedName')
    let password = getString(req, 'password')
    let email = getString(req, 'email')
    let phone = getPhone(req, 'phone')
    let is_age18 = req.body.is_age18
    users.push({
        id: maxId,
        username,
        showedName,
        password,
        email,
        phone,
        is_age18,
        icon: '',
        rating: 0,
        bio: '',
        is_admin: false
    })
    res.json({})
})

userRoutes.post('/login', (req, res) => {
    let username = getString(req, 'username')
    let password = getString(req, 'password')
  
    let user = users.find(user => user.username === username)
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
  })

  userRoutes.get('/role', (req, res) => {
    res.json({
      user: req.session.user,
    })
  })
  