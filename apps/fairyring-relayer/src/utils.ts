export const fetch = (input: any | string | URL, init?: any | undefined) =>
  import('isomorphic-fetch').then(({ default: fetch }) => fetch(input, init))

export type Fetchish = typeof fetch
