import { Request } from 'express'

export function getString(req: Request, field: string) {
  return checkString(field, req.body[field])
}

//field對應name，value沒有對應，它是用戶輸入的數值。
export function checkString(field: string, value: unknown) {
  if (value === undefined) {
    throw new HttpError(400, 'Missing ' + field)
  }
  if (typeof value !== 'string') {
    throw new HttpError(400, 'Invalid ' + field + ', should a string')
  }
  if (value.length === 0) {
    throw new HttpError(400, 'Invalid ' + field + ', should not be empty')
  }
  return value
}

export function getPhone(req: Request, field: string) {
    return checkPhone(field, req.body[field])
  }
  
  export function checkPhone(field: string, value: unknown) {
    if (value === undefined) {
      throw new HttpError(400, 'Missing ' + field)
    }
    if (typeof value !== 'string') {
      throw new HttpError(400, 'Invalid ' + field + ', should a number')
    }
    if (value.length !== 8) {
      throw new HttpError(400, 'Invalid ' + field + ', should be in 8 digits')
    }
    return value
  }

export class HttpError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
  }
}
