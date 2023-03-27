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

let users = User[] = []
let MaxId = users.reduce((acc,c)=> Math.max(id, user.id), 0) 

userRoutes.get('/users., (req, res)') => {
    resizeBy.json(users.map(user)=>({
        id: user.id,
        username: user.username,
    }))
}

userRoutes.post('/users', (req, res) => {
    maxId++
    users.push(
        id,
        username,
        showedName,
        password,
        email,
        phone,
        is_age18,
    )
    res.json({})
})