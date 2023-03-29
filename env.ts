import { config } from 'dotenv'
import populateEnv from 'populate-env'

export let env = {
  PORT: 8100,
  DB_NAME: '',
  DB_USER: '',
  DB_PASSWORD: '',
  DB_PORT: 5432,
  // GOOGLE_CLIENT_ID: '',
  // GOOGLE_CLIENT_SECRET: '',
}

config()
//check會否set漏嘢，halt可在遇上error時，成個node.js停咗佢。
populateEnv(env, { mode: 'halt' })
