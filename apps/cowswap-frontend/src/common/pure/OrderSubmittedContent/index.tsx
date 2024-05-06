import { isCowOrder } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ButtonPrimary, ExternalLink } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

import { EnhancedTransactionLink } from 'legacy/components/EnhancedTransactionLink'
import { HashType } from 'legacy/state/enhancedTransactions/reducer'

import AnimatedConfirmation from 'common/pure/AnimatedConfirmation'

const Wrapper = styled.div`
  width: 100%;
  padding: 30px 15px 15px 15px;
  display: flex;
  gap: 20px;
  align-items: center;
  flex-direction: column;
`

const Caption = styled.h3`
  font-weight: 500;
  font-size: 20px;
  margin: 0;
`

const ActionButton = styled(ButtonPrimary)`
  margin-top: 30px;
`

export interface OrderSubmittedContentProps {
  onDismiss(): void
  chainId: SupportedChainId
  isSafeWallet: boolean
  account: string
  hash: string
  fairblockTransactionHash?: string
}

export function OrderSubmittedContent({
  chainId,
  account,
  isSafeWallet,
  hash,
  fairblockTransactionHash,
  onDismiss,
}: OrderSubmittedContentProps) {
  const tx = {
    hash,
    hashType: isSafeWallet && !isCowOrder('transaction', hash) ? HashType.GNOSIS_SAFE_TX : HashType.ETHEREUM_TX,
    safeTransaction: {
      safeTxHash: hash,
      safe: account,
    },
  }

  let maybeFairblockTransactionHashHref: string | null = null
  if (fairblockTransactionHash) {
    maybeFairblockTransactionHashHref = `https://testnet-explorer.fairblock.network/fairyring/transactions/${fairblockTransactionHash}`
  }

  return (
    <Wrapper>
      <AnimatedConfirmation />
      <Caption>
        <Trans>Timelock Encrypted Limit Order Submitted</Trans>
      </Caption>
      <EnhancedTransactionLink chainId={chainId} tx={tx} fairblockTransactionHash={fairblockTransactionHash} />
      {maybeFairblockTransactionHashHref && (
        <ExternalLink href={maybeFairblockTransactionHashHref}>
          <>
            View encrypted limit order transaction on Fairychain <span style={{ fontSize: '0.8em' }}>↗</span>
          </>
        </ExternalLink>
      )}
      <ActionButton onClick={onDismiss}>
        <Trans>Continue</Trans>
      </ActionButton>
    </Wrapper>
  )
}
