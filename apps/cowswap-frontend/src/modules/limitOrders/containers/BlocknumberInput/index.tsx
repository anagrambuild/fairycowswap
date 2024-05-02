import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { HeadingText } from 'modules/limitOrders/pure/BlocknumberInput/HeadingText'
import { fairblockAtom, updateFairblockAtom } from 'modules/limitOrders/state/fairblockAtom'

import * as styledEl from './styled'

export function BlocknumberInput() {
  const { chainId } = useWalletInfo()


  // Rate state
  const { currentBlockHeight, isLoading, targetBlockHeightDisplayed, targetBlockHeightTyped } =
    useAtomValue(fairblockAtom)
  // const updateRate = useUpdateActiveRate()
  const updateFairblockState = useSetAtom(updateFairblockAtom)

  const handleUserInput = useCallback(
    (typedValue: string) => {
      updateFairblockState({
        targetBlockHeightDisplayed: parseInt(typedValue, 10) ?? '',
        targetBlockHeightTyped: typedValue,
      })
    },
    [updateFairblockState]
  )

  const hasSetInitialBlockRef = useRef<boolean>(false)
  useEffect(() => {

    const doAsync = async () => {
      // const res = await fetch('https://testnet-api.fairblock-api.com/fairyring/keyshare/pub_key')
      // const json = await res.json()
      if (!currentBlockHeight) {
        return;
      }

      const maybeBlocknumber = currentBlockHeight.toString(10) //json.activePubKey?.expiry

      if (hasSetInitialBlockRef.current === true) {
        return
      }

      updateFairblockState({
        currentBlockHeight: parseInt(maybeBlocknumber, 10) ?? '',
        targetBlockHeightTyped: maybeBlocknumber,
        targetBlockHeightDisplayed: parseInt(maybeBlocknumber, 10) ?? '',
      })

      hasSetInitialBlockRef.current = true;
    }

    if (hasSetInitialBlockRef.current === true) {
      return
    }
    doAsync()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBlockHeight])

  return (
    <>
      <styledEl.Wrapper>
        <styledEl.Header>
          {/* <HeadingText  /> */}
          <styledEl.MarketPriceButton onClick={() => {
            if (currentBlockHeight) {

            updateFairblockState({
              // currentBlockHeight: parseInt(currentBlockHeight + 10, 10) ?? '',
              targetBlockHeightTyped: (+currentBlockHeight + 10).toString(),
              targetBlockHeightDisplayed: parseInt((currentBlockHeight + 10).toString(10), 10) ?? '',
            })
          }

          }}>
            <span>Set 10 blocks from now</span>
          </styledEl.MarketPriceButton>
        </styledEl.Header>

        <styledEl.Body>
          {
            <styledEl.NumericalInput
              $loading={false}
              placeholder="0"
              id="rate-limit-amount-input"
              value={targetBlockHeightDisplayed?.toString(10) ?? ''}
              onUserInput={handleUserInput}
            />
          }
        </styledEl.Body>
      </styledEl.Wrapper>
    </>
  )
}
