import { MetadataApi } from '@cowprotocol/app-data'
// import { isBarnBackendEnv } from '@cowprotocol/common-utils'
import { OrderBookApi } from '@cowprotocol/cow-sdk'

const prodBaseUrls = process.env.REACT_APP_ORDER_BOOK_URLS
  ? JSON.parse(process.env.REACT_APP_ORDER_BOOK_URLS)
  : undefined

console.log('prodBaseUrls', prodBaseUrls)

const isBarnBackendEnv= true;
export const metadataApiSDK = new MetadataApi()
export const orderBookApi = new OrderBookApi({
  env: isBarnBackendEnv ? 'staging' : 'prod',
  ...(prodBaseUrls ? { baseUrls: prodBaseUrls } : undefined),
})

