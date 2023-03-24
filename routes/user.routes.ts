import { Router } from 'express'

export let userRoutes = Router()

export type User ={
    id: number
    username: string
    password: string
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
        password,
    )
    res.json({})
})