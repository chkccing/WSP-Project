import { Router } from 'express'
import { Url } from 'url'

export let userRoutes = Router()

export type User ={
    id: number
    username: string
    showedName: string
    icon: Url
    rating: number
    bio: string
    email: string
    phone: number
    password: string
    is_age18: boolean
    is_admin: boolean
}

let users: User[] = []
let maxId = users.reduce((id, user)=> Math.max(id, user.id), 0) 

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
    let username = req.body.username
    let showedName = req.body.showedName
    let password = req.body.password
    let email = req.body.email
    let phone = req.body.phone
    let is_age18 = req.body.is_age18
    users.push(
        id: maxId,
        username,
        showedName,
        password,
        email,
        phone,
        is_age18,
    )
    res.json({})
})