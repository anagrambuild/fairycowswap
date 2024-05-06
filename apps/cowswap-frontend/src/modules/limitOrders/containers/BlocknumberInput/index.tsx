import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useRef } from 'react'

import { HeadingText } from 'modules/limitOrders/pure/BlocknumberInput/HeadingText'
import { fairblockAtom, updateFairblockAtom } from 'modules/limitOrders/state/fairblockAtom'

import * as styledEl from './styled'

export function BlocknumberInput() {
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
      if (!currentBlockHeight) {
        return
      }
      const maybeBlocknumber = currentBlockHeight.toString(10)

      if (hasSetInitialBlockRef.current === true) {
        return
      }

      updateFairblockState({
        currentBlockHeight: parseInt(maybeBlocknumber, 10) ?? '',
        targetBlockHeightTyped: maybeBlocknumber,
        targetBlockHeightDisplayed: parseInt(maybeBlocknumber, 10) ?? '',
      })

      hasSetInitialBlockRef.current = true
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
          <HeadingText currency={null} inputCurrency={null} rateImpact={0} />
          <styledEl.MarketPriceButton
            onClick={() => {
              if (currentBlockHeight) {
                updateFairblockState({
                  targetBlockHeightTyped: (+currentBlockHeight + 10).toString(),
                  targetBlockHeightDisplayed: parseInt((currentBlockHeight + 10).toString(10), 10) ?? '',
                })
              }
            }}
          >
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
