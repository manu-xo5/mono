import { SERVER_BASE } from '@/utils/constants'

export class ApiError extends Error {
  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, Error)
  }
}

export type TRestApi = typeof API_VX;

export const API_VX = async (url: RequestInfo, init?: RequestInit) => {
  const res = await window.fetch(SERVER_BASE + '/api/vx' + url, {
    credentials: 'include',
    ...init,
  })

  if (!res.ok) {
    throw new ApiError('server error')
  }

  return res
}

