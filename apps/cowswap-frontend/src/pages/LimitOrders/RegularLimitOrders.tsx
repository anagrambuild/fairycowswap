import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useAtom } from 'jotai'

import { useOrders } from 'legacy/state/orders/hooks'

import { LimitOrdersWidget, useIsWidgetUnlocked } from 'modules/limitOrders'
import { updateFairblockAtom } from 'modules/limitOrders/state/fairblockAtom'
import { OrdersTableWidget, TabOrderTypes } from 'modules/ordersTable'
import * as styledEl from 'modules/trade/pure/TradePageLayout'
import { useEffect } from 'react'

export function RegularLimitOrders() {
  const isUnlocked = useIsWidgetUnlocked()
  const { chainId, account } = useWalletInfo()
  const allLimitOrders = useOrders(chainId, account, UiOrderType.LIMIT)

  const [,updateFairblock] = useAtom(updateFairblockAtom)

  const handleFairyringHeightChange = (blockNumber: number) => {
    updateFairblock({
      currentBlockHeight: blockNumber,
    })
    console.log('handleFairyringHeightChange', blockNumber)
  }

  // start 
  const handleWebSocket = () => {
    const wsURL = 'wss://testnet-rpc.fairblock-api.com/websocket'
    const ws = new WebSocket(wsURL);
    ws.onopen = (_) => {
      ws.send(
        JSON.stringify({
          jsonrpc: '2.0',
          method: 'subscribe',
          params: ["tm.event='NewBlock'"],
          id: 1,
        })
      );
    };
    ws.onmessage = async (event) => {
      const { result } = JSON.parse(event.data);

      if (result == null || result.events == null) {
        return;
      }

      const height = result?.data?.value?.block?.last_commit?.height;
      if (height) {
        handleFairyringHeightChange(Number(height));
      }
    };
    ws.onerror = (err) => {
      console.log('Websocket Error: ', err);
      // toast({
      //   title: 'Connection Error!',
      //   description: `Something went wrong while connecting to the chain`,
      //   status: 'error',
      // });
    };
  };


  useEffect(() => {
    handleWebSocket();
  }, []); // eslint-disable-line



  console.log('allLimitOrders', allLimitOrders)
  return (
    <styledEl.PageWrapper isUnlocked={isUnlocked}>
      <styledEl.PrimaryWrapper>
        <LimitOrdersWidget />
      </styledEl.PrimaryWrapper>

      <styledEl.SecondaryWrapper>
        <OrdersTableWidget
          displayOrdersOnlyForSafeApp={false}
          orderType={TabOrderTypes.LIMIT}
          orders={allLimitOrders}
        />
      </styledEl.SecondaryWrapper>
    </styledEl.PageWrapper>
  )
}
