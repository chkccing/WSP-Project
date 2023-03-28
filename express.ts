import { Request } from 'express'

export function getString(req: Request, field: string) {
  if(!(field in req.body)){
    throw new HttpError (400, 'Missing' + field)
  }
  let value = req.body[field]
  if (typeof value !== 'string'){
    throw new HttpError(400, 'Invalid' + field + ', should be a string')
  }
  if(value.length === 0){
    throw new HttpError(400, 'Invalid' + field + ', should not be empty')
  }
  return value
}

export class HttpError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
  }
}
