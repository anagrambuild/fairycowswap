import 'dotenv/config'

import type { AppDb } from './db'
import { appDbSchema } from './db'

import { eq, desc, and } from 'drizzle-orm'
import first from 'lodash/first'

import { Decimal } from 'decimal.js'
import { OrderCreation, Order } from '@cowprotocol/cow-sdk'
import { postOrder } from './orderbook'

Decimal.set({ toExpPos: 9e15 })
Decimal.set({ toExpNeg: -9e15 })
Decimal.set({ rounding: Decimal.ROUND_DOWN })
Decimal.set({ precision: 64 })

export const createFairyringCowswapActivitiesWithDependencies = (db: AppDb) => ({
  async pullAllCowswapOrdersForBlocks(
    toBlockNumber: string = 'latest',
    fromBlockNumber: string = 'last-indexed'
  ) {
    console.log(`Running pullAllCowswapOrdersForBlocks`)
    const _watcherData = await db
      .select()
      .from(appDbSchema.fairyringWatcher)
      .where(eq(appDbSchema.fairyringWatcher.fairyring_chain_id, 'fairyring-testnet-1'))
      .limit(1)
    const watcherData = first(_watcherData)
    if (!watcherData) {
      console.error('No watcherData found for testnet')
      return
    }

    // get orders here via sdk
    const ordersFromBlockRange: OrderCreation[] = []

    return {
      orders: ordersFromBlockRange,
      startBlock: fromBlockNumber,
      endBlock: toBlockNumber,
    }
  },
  async postCowSwapOrdersToOrderbook(orders: Order[], chainId: number) {
    let postResults: string[] = []
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i]
      console.log(`Posting order to orderbook: ${order}`)
      const postRes = await postOrder(order, chainId)
      postResults.push(postRes)
    }
    return postResults
  },
})
