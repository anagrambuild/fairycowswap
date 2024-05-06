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
  defaultLimitOrderDecryptTime, // 1 minute
  { title: '2 Minutes', value: ms`2m` },
  { title: '5 Minutes', value: ms`5m` },
  // { title: '6 Months (max)', value: MAX_CUSTOM_DEADLINE }, // TODO: custom decrypt time
]
