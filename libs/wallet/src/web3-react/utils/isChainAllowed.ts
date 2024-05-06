import { ALL_SUPPORTED_CHAIN_IDS, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Connector } from '@web3-react/types'

import { getWeb3ReactConnection } from './getWeb3ReactConnection'

import { ConnectionType } from '../../api/types'

const ONLY_SEPOLIA = [SupportedChainId.SEPOLIA]

const allowedChainsByWallet: Record<ConnectionType, SupportedChainId[]> = {
  [ConnectionType.INJECTED]: ONLY_SEPOLIA, //ALL_SUPPORTED_CHAIN_IDS,
  [ConnectionType.INJECTED_WIDGET]: ONLY_SEPOLIA, //ALL_SUPPORTED_CHAIN_IDS,
  [ConnectionType.COINBASE_WALLET]: ONLY_SEPOLIA, //ALL_SUPPORTED_CHAIN_IDS,
  [ConnectionType.WALLET_CONNECT_V2]: ONLY_SEPOLIA, //ALL_SUPPORTED_CHAIN_IDS,
  [ConnectionType.NETWORK]: ONLY_SEPOLIA, //ALL_SUPPORTED_CHAIN_IDS,
  [ConnectionType.GNOSIS_SAFE]: ONLY_SEPOLIA, //ALL_SUPPORTED_CHAIN_IDS,
  [ConnectionType.TALLY]: ONLY_SEPOLIA, //ALL_SUPPORTED_CHAIN_IDS,
  [ConnectionType.TRUST]: ONLY_SEPOLIA, //ALL_SUPPORTED_CHAIN_IDS,
  // [ConnectionType.LEDGER]: ALL_SUPPORTED_CHAIN_IDS,
  [ConnectionType.TREZOR]: ONLY_SEPOLIA, //ALL_SUPPORTED_CHAIN_IDS,
  [ConnectionType.KEYSTONE]: ONLY_SEPOLIA, //ALL_SUPPORTED_CHAIN_IDS,
  [ConnectionType.ALPHA]: [],
  [ConnectionType.AMBIRE]: [],
  [ConnectionType.ZENGO]: [],
}

export function isChainAllowed(connector: Connector, chainId: number): boolean {
  const connection = getWeb3ReactConnection(connector)

  return allowedChainsByWallet[connection.type].includes(chainId)
}
