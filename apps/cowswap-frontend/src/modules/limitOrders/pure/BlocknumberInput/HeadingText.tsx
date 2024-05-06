import { UI } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

type Props = {
  currency: Currency | null
  inputCurrency: Currency | null
  rateImpact: number
}

const Wrapper = styled.span`
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  justify-content: flex-start;
  text-align: left;
  gap: 0 3px;
  opacity: 0.7;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 1;
  }
`

export function HeadingText({currency }: Props) {
  if (!currency) {
    return <Wrapper> Target Fairyring Block</Wrapper>
  }

  return (
    <Wrapper>
      {/* Price of <TokenSymbol token={currency} /> */}
      Target Fairyring Block
    </Wrapper>
  )
}
