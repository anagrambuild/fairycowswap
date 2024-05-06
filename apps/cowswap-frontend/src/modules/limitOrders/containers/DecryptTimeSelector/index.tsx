import { useSetAtom } from 'jotai'
import { useAtomValue } from 'jotai'
import { useCallback, useMemo, useRef } from 'react'

import { DecryptTimeSelector } from 'modules/limitOrders/pure/DecryptTimeSelector'
import { LimitOrderDecryptTime, limitOrdersDecryptTimes } from 'modules/limitOrders/pure/DecryptTimeSelector/deadlines'
import {
  limitOrdersSettingsAtom,
  updateLimitOrdersSettingsAtom,
} from 'modules/limitOrders/state/limitOrdersSettingsAtom'

export function DecryptTimeInput() {
  const { decryptTimeMilliseconds } = useAtomValue(limitOrdersSettingsAtom)
  const updateSettingsState = useSetAtom(updateLimitOrdersSettingsAtom)
  const currentDeadlineNode = useRef<HTMLButtonElement>()
  const existingDecryptTime = useMemo(() => {
    return limitOrdersDecryptTimes.find((item) => item.value === decryptTimeMilliseconds)
  }, [decryptTimeMilliseconds])

  const selectDecryptTime = useCallback(
    (deadline: LimitOrderDecryptTime) => {
      updateSettingsState({ 
        decryptTimeMilliseconds: deadline.value, 
        // customDeadlineTimestamp: null // TODO(johnrjj) - Custom decrypt times
      })
      currentDeadlineNode.current?.click() // Close dropdown
    },
    [updateSettingsState]
  )

  const selectCustomDeadline = useCallback(
    (customDeadline: number | null) => {
      updateSettingsState({ customDeadlineTimestamp: customDeadline })
    },
    [updateSettingsState]
  )

  return (
    <DecryptTimeSelector
      decryptTime={existingDecryptTime}
      customDeadline={null}
      selectDecryptTime={selectDecryptTime}
      selectCustomDeadline={selectCustomDeadline}
    />
  )
}
