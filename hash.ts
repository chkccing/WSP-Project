import { compare, hash } from 'bcryptjs'
import { client } from './db'

// deepcode ignore HardcodedSecret: this is number of round, not fixed salt
const ROUND = 12

export function hashPassword(password: string): Promise<string> {
  return hash(password, ROUND)
}

export function comparePassword(options: {
  password: string
  password_hash: string
}): Promise<boolean> {
  return compare(options.password, options.password_hash)
}

async function demo() {
  for (let i = 0; i < 10; i++) {
    console.time('hash once')
    let hash = await hashPassword('password')
    console.timeEnd('hash once')

    console.log('length:', hash.length)

    // console.time('compare once')
    // let matched = await comparePassword({
    //   password: 'password',
    //   password_hash: hash,
    // })
    // console.timeEnd('compare once')

    // console.log('matched?', matched)
    // console.log('hash:', hash)
  }
}

export async function migrate() {
  //對database中沒有hash password的users，逐個users攞晒出來。
  let result = await client.query(/* sql */ `
select id, password
from users
where password_hash is null
`)

  for (let row of result.rows) {
    //食users password，然後update database，逐個update。
    let password_hash = await hashPassword(row.password)
    await client.query(
      /* sql */ `
update users
set password_hash = $1
where id = $2
`,
      [password_hash, row.id],
    )
  }

  await client.end()

  console.log('done.')
}

// migrate().catch(e => console.error(e))

console.log({demo,migrate})
