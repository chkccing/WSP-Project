import { Router } from 'express'
import { client } from '../db'
import { getString, getPhone, HttpError } from '../express'
import { comparePassword, hashPassword } from '../hash'
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
  phone: string
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

// //註冊功能測試
// userRoutes.post('/signUp', (req, res) => {
//   console.log(req.body);
//   res.json({
//     user: 1,
//   })
// })

userRoutes.post('/signUp', async (req, res, next) => {
  try {
    let username = getString(req, 'username')
    let showedName = getString(req, 'showedName')
    let password = getString(req, 'password')
    let email = getString(req, 'Email')
    let phone = getPhone(req, 'phone')
    let password_hash = await hashPassword(password)
    //加上 >= 18，以判定是否18歲或以上。
    let is_age18 = req.body.age >= 18

// //此句用於檢測bug在什麼地方，不用。
// console.log({is_age18})


//以下code的運作原理，是按照table users的username column檢出id，這裏只是檢查出一個空白的array。然後進入if(user){}的條件判斷，由於是空白，自然可以進入「否」的next step，若然「是」便throw error。
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

// console.log('post signup query result rows:',result.rows)
// console.log('post signup query result rows[0]:',result.rows[0])

    if (user) {
      throw new HttpError(409, 'this username is already in use')
    }
    
    result = await client.query(
      /* sql */ `
insert into users
(username, showedName, password_hash, email, phone, is_age18)
values
($1, $2, $3, $4, $5, $6)
returning id
    `,
      [username, showedName, password_hash, email, phone, is_age18],
    )

    req.session.user = {
      id: user.id,
      name: username,
      avatar: null

    }
    req.session.save()
    
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
, password_hash
from users
where username = $1
    `,
      [username],
    )
    let user = result.rows[0]

    if (!user) {
      throw new HttpError(403, 'wrong username')
    }

    // if (user.password !== password) {
    //   throw new HttpError(403, 'wrong username or password')
    if (!await comparePassword({password, password_hash: user.password_hash})){
      throw new HttpError(403, 'wrong username or password')
    }
   
    req.session.user = {
      id: user.id,
      name: username,
      avatar: null

    }
    req.session.save()

    // res.json({ id: user.id}) 
    res.redirect('/index.html')
    
  } catch (error) {
    next(error)
  }
} )

userRoutes.get('/role', (req, res) => {
  res.json({
    user: req.session.user,
  })
})


