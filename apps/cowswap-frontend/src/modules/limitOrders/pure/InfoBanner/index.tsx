import { useState, useEffect } from 'react'

import AlertIcon from '@cowprotocol/assets/cow-swap/alert-circle.svg'

import SVG from 'react-inlinesvg'
import { HashLink } from 'react-router-hash-link'

import * as styledEl from './styled'

export function InfoBanner() {
  // Explainer banner for orders
  const LOCAL_STORAGE_KEY = 'limitOrders_showInfoBanner'
  const [showBanner, setShowBanner] = useState(() => {
    const item = localStorage.getItem(LOCAL_STORAGE_KEY)
    return item !== null ? item === 'true' : true
  })

  const closeBanner = (): void => {
    setShowBanner(false)
    localStorage.setItem(LOCAL_STORAGE_KEY, 'false')
  }

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, showBanner.toString())
  }, [showBanner])

  // If the banner is not shown, don't render anything
  if (!showBanner) return null

  return (
    <styledEl.InfoPopup>
      <div className="icon">
        <SVG src={AlertIcon} />
      </div>
      <div className="content">
        FairyCoW Swap is a demonstration of Fairblock's modular programmable encryption with an existing intent-driven application on the EVM. Do not use with real money. Available only Sepolia.{' '}
        <HashLink target="_blank" to="/faq/limit-order#how-do-fees-work">
          Learn more
        </HashLink>
      </div>

      <styledEl.CloseIcon onClick={() => closeBanner()} />
    </styledEl.InfoPopup>
  )
}
