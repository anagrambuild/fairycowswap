import { ChangeEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { ButtonPrimary, ButtonSecondary, ExternalLink, ExternalLinkIcon, LinkIcon, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import { Menu } from '@reach/menu-button'
import { ChevronDown } from 'react-feather'

import {
  calculateMinMax,
  formatDateToLocalTime,
  getInputStartDate,
  getTimeZoneOffset,
  limitDateString,
} from 'modules/limitOrders/pure/DeadlineSelector/utils'

import { CowModal as Modal } from 'common/pure/Modal'

import { LimitOrderDecryptTime, limitOrdersDecryptTimes } from './deadlines'
import * as styledEl from './styled'
import { Toggle } from 'legacy/components/Toggle'

import ShieldImage from '@cowprotocol/assets/cow-swap/protection.svg'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { deadlinePartsDisplay } from 'modules/twap/utils/deadlinePartsDisplay'
import { InfoIcon } from 'legacy/components/InfoIcon'

export const MarketPriceButton = styled.button`
  text-decoration: none !important;
  background: var(${UI.COLOR_PAPER});
  color: inherit;
  white-space: nowrap;
  border: none;
  font-weight: 500;
  cursor: pointer;
  border-radius: 9px;
  padding: 5px 8px;
  font-size: 11px;
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out, color var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }

  &:not(:disabled):hover {
    background: var(${UI.COLOR_PRIMARY});
    color: var(${UI.COLOR_BUTTON_TEXT});
  }
`

const IconImage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  > svg {
    fill: currentColor;
    margin: 0 3px 0 0;
  }
`

const CUSTOM_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: '2-digit',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
}

export interface DeadlineSelectorProps {
  decryptTime: LimitOrderDecryptTime | undefined
  customDeadline: number | null
  selectDecryptTime(deadline: LimitOrderDecryptTime): void
  selectCustomDeadline(deadline: number | null): void
}

export function DecryptTimeSelector(props: DeadlineSelectorProps) {
  const {decryptTime, selectDecryptTime } = props // TODO selectCustomDecryptTime

  const currentDeadlineNode = useRef<HTMLButtonElement | null>(null)
  const [[minDate, maxDate], setMinMax] = useState<[Date, Date]>(calculateMinMax)

  const min = limitDateString(minDate)
  const max = limitDateString(maxDate)

  const [error, setError] = useState<string | null>(null)
  const [value, setValue] = useState<string>('')

  // Validate `value` from datetime-local input
  useEffect(() => {
    try {
      const newDeadline = new Date(value).getTime()
      const { timeZone } = Intl.DateTimeFormat().resolvedOptions()

      if (newDeadline < minDate.getTime()) {
        setError(`Must be after ${minDate.toLocaleString()} ${timeZone}`)
      } else if (newDeadline > maxDate.getTime()) {
        setError(`Must be before ${maxDate.toLocaleString()} ${timeZone}`)
      } else {
        setError(null)
      }
    } catch (e) {
      console.error(`[DeadlineSelector] Failed to parse input value to Date`, value, e)
      setError(`Failed to parse date and time provided`)
    }
  }, [maxDate, minDate, value])

  const existingDeadline = useMemo(() => limitOrdersDecryptTimes.find((item) => item === decryptTime), [decryptTime])

  // const customDeadlineTitle = useMemo(() => {
  //   if (!customDeadline) {
  //     return ''
  //   }
  //   return new Date(customDeadline * 1000).toLocaleString(undefined, CUSTOM_DATE_OPTIONS)
  // }, [customDeadline])

  const setDeadline = useCallback(
    (deadline: LimitOrderDecryptTime) => {
      selectDecryptTime(deadline)
      // selectCustomDeadline(null) // reset custom deadline
      currentDeadlineNode.current?.click() // Close dropdown
    },
    [selectDecryptTime]
  )

  // Sets value from input, if it exists
  const onChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
      // Some browsers offer a `clear` button in their date picker
      // That action sets the value to `''`
      // In that case, use the default min value
      setValue(value || formatDateToLocalTime(minDate))
    },
    [minDate]
  )

  const [isOpen, setIsOpen] = useState(false)

  // const openModal = useCallback(() => {
  //   currentDeadlineNode.current?.click() // Close dropdown
  //   setIsOpen(true)
  //   setError(null)

  //   const minMax = calculateMinMax()
  //   setMinMax(minMax) // Update min/max every time modal is open
  //   setValue(formatDateToLocalTime(getInputStartDate(customDeadline, minMax[0]))) // reset input to clear unsaved values
  // }, [customDeadline])

  const onDismiss = useCallback(() => setIsOpen(false), [])

  // const setCustomDeadline = useCallback(() => {
  //   // `value` is a timezone aware string
  //   // thus, we append the timezone offset (if any) when building the date object
  //   const newDeadline = Math.round(new Date(value + getTimeZoneOffset()).getTime() / 1000)

  //   selectCustomDeadline(newDeadline)
  //   onDismiss()
  // }, [onDismiss, selectCustomDeadline, value])

  return (
    <styledEl.Wrapper>
      {/* <styledEl.Wrapper> */}

      {/* </styledEl.Wrapper> */}

      <styledEl.Label style={{ marginBottom: 12 }}>
        {/* <styledEl.Wrapper>



      <IconImage>
          <SVG src={ShieldImage} width="16" height="16" title="Price protection" />
        </IconImage>{' '}
        Price protection

        </styledEl.Wrapper> */}

        <Trans>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              // marginBottom: 12,
            }}
          >
            <span
              style={{
                display: 'inline-block',
                marginRight: 8,
              }}
            >
              Order Decryption Time
            </span>

            <InfoIcon
              content={
                <div>
                  Decrypt and make public the encrypted limit order after the selected length of time. Currently
                  FairyCoW only supports a set of short-lived encryption times for demo purposes.
                </div>
              }
            />
          </div>
        </Trans>
      </styledEl.Label>
      <Menu>
        <styledEl.Current ref={currentDeadlineNode as any} $custom={false}>
          <span>{existingDeadline?.title}</span>
          <ChevronDown size="18" />
        </styledEl.Current>
        <styledEl.ListWrapper>
          {limitOrdersDecryptTimes.map((item) => (
            <li key={item.value}>
              <styledEl.ListItem onSelect={() => setDeadline(item)}>
                <Trans>{item.title}</Trans>
              </styledEl.ListItem>
            </li>
          ))}
          {/* Disable custom for demo */}
          {/* <styledEl.ListItem onSelect={openModal}>
            <Trans>Custom</Trans>
          </styledEl.ListItem> */}
        </styledEl.ListWrapper>
      </Menu>

      {/* Custom deadline modal */}
      <Modal isOpen={isOpen} onDismiss={onDismiss}>
        <styledEl.ModalWrapper>
          <styledEl.ModalHeader>
            <h3>
              <Trans>Set custom deadline</Trans>
            </h3>
            <styledEl.CloseIcon onClick={onDismiss} />
          </styledEl.ModalHeader>
          <styledEl.ModalContent>
            <styledEl.CustomLabel htmlFor="custom-deadline">
              <Trans>Choose a custom deadline for your limit order:</Trans>
              <styledEl.CustomInput
                type="datetime-local"
                id="custom-deadline"
                onChange={onChange}
                // For some reason, `min/max` values require the same format as `value`,
                // but they don't need to be in the user's timezone
                min={min}
                max={max}
                value={value}
                // The `pattern` is not used at all in `datetime-local` input, but is in place
                // to enforce it when it isn't support. In that case it's rendered as a regular `text` input
                pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}"
                onFocus={(event: React.FocusEvent<HTMLInputElement>) => {
                  // Bug fix for resetting input with `reset` button iOS
                  // See https://github.com/facebook/react/issues/8938
                  event.target.defaultValue = ''
                }}
              />
            </styledEl.CustomLabel>
            {/* TODO: style me!!! */}
            {error && (
              <div>
                <Trans>{error}</Trans>
              </div>
            )}
          </styledEl.ModalContent>
          <styledEl.ModalFooter>
            <ButtonSecondary onClick={onDismiss}>Cancel</ButtonSecondary>
            {/* <ButtonPrimary onClick={set} disabled={!!error}>
              <Trans>Set custom date</Trans>
            </ButtonPrimary> */}
          </styledEl.ModalFooter>
        </styledEl.ModalWrapper>
      </Modal>

      {/* <styledEl.Wrapper style={{ marginTop: 2 }}> */}
      <div style={{ marginTop: 16, marginBottom: 4 }}>
        {/* <ExternalLink href={'https://www.fairblock.network/'}>
        Powered by Fairblockz
        </ExternalLink> */}
        <MarketPriceButton as={'a'} href={'https://www.fairblock.network/'} target="_blank">
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            <span>Encryption Powered by Fairblock</span>

            <LinkIcon
              style={{
                height: 12,
                width: 12,
                marginLeft: 4,
              }}
            />
            {/* <ExternalLinkIcon href={'https://www.fairblock.network/'} >pew</ExternalLinkIcon> */}
          </span>
        </MarketPriceButton>
        {/* </styledEl.Wrapper> */}
      </div>
    </styledEl.Wrapper>
  )
}

// const LinkIconWrapper = styled.span`
//   text-decoration: none;
//   cursor: pointer;
//   align-items: center;
//   justify-content: center;
//   display: flex;

//   :hover {
//     text-decoration: none;
//     opacity: 0.7;
//   }

//   :focus {
//     outline: none;
//     text-decoration: none;
//   }

//   :active {
//     text-decoration: none;
//   }
// `
// export const LinkIcon = styled(LinkIconFeather)`
//   height: 16px;
//   width: 18px;
//   margin: 0 10px 0 0;
//   stroke: currentColor;
// `
