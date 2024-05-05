import ms from 'ms.macro'

import { MAX_ORDER_DEADLINE } from 'common/constants/common'

export interface LimitOrderDecryptTime {
  title: string
  value: number
}

export const MIN_CUSTOM_DEADLINE = ms`30min`
export const MAX_CUSTOM_DEADLINE = MAX_ORDER_DEADLINE

export const defaultLimitOrderDecryptTime: LimitOrderDecryptTime = { title: '1 Minute', value: ms`1m` }

export const limitOrdersDecryptTimes: LimitOrderDecryptTime[] = [
  { title: '1 Minute', value: ms`1m` },
  { title: '2 Minutes', value: ms`2m` },
  { title: '5 Minutes', value: ms`5m` },
  // { title: '30 Minutes', value: ms`30m` },
  // { title: '1 Hour', value: ms`1 hour` },
  // { title: '1 Day', value: ms`1d` },
  // { title: '3 Days', value: ms`3d` },
  // defaultLimitOrderDeadline,
  // { title: '1 Month', value: ms`30d` },
  // { title: '6 Months (max)', value: MAX_CUSTOM_DEADLINE },
]
