import { OrderBookApi, SupportedChainId, Order } from '@cowprotocol/cow-sdk'

export const postOrder = (o: Order, chainId: SupportedChainId) => {
  const orderBookApi = new OrderBookApi({ chainId })
  return orderBookApi.sendOrder(o)
}

export const getOrders = (owner: `0x${string}`, chainId: SupportedChainId, limit = 100, offset = 0) => {
  const orderBookApi = new OrderBookApi({ chainId })
  return orderBookApi.getOrders({
    owner,
    limit,
    offset,
  })
}
