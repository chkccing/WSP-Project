import { compare, hash } from 'bcryptjs'
import { client } from './db'

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

  }
}

async function migrate() {
  let result = await client.query(/* sql */ `
select id, password
from users
where password_hash is null
`)

  for (let row of result.rows) {
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


