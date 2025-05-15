export class ApiError extends Error {
  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, Error)
  }
}

export const api = (async (url, init) => {
  const res = await window.fetch(url, init)

  if (!res.ok) {
    throw new ApiError("server error")
  }

  return res
}) satisfies typeof window.fetch
