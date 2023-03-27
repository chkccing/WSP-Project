import { Router } from 'express'
import { getString, getPhone, HttpError } from '../express'
import '../session'

export let userRoutes = Router()

export type User = {
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

let users: User[] = [
    { id: 1, username: 'admin', showedName: 'admin', icon: 'null', rating: 5, bio: '', email: '', phone: 91234567, is_age18: true, is_admin: true, password: 'secret' },
    { id: 2, username: 'test1', showedName: 'test1', icon: 'null', rating: 1, bio: '', email: '', phone: 92345678, is_age18: true, is_admin: false, password: 'secret' },
  ]

let maxId = users.reduce((id, item) => Math.max(id, item.id), 0) 

userRoutes.get('/users', (req, res) => {
    res.json(
        users.map(user => ({
        id: user.id,
        username: user.username,
    }))
    )
})

userRoutes.post('/users', (req, res) => {
    let username = getString(req, 'username')
    let showedName = getString(req, 'showedName')
    let password = getString(req, 'password')
    let email = getString(req, 'email')
    let phone = getPhone(req, 12345678)
    let is_age18 = req.body.is_age18

    let user = users.find(user => user.username === username)
    if (user) {
        throw new HttpError(409, 'this username is already in used')
     }

    let userEmail = users.find(userEmail => userEmail.email === email)
    if (userEmail) {
        throw new HttpError(409, 'this email address is already in used')
    }

    let userPhone = users.find(userPhone => userPhone.phone === phone)
    if (userPhone) {
        throw new HttpError(409, 'this phone number is already in used')
    }

    maxId++
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
      is_age18: user.is_age18,
    }
  
    res.json({ id: user.id })
  })

  userRoutes.get('/role', (req, res) => {
    res.json({
      user: req.session.user,
    })
  })
  