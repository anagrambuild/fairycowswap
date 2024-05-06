import { atom, createStore } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'

interface FairblockLocalAccount {
  pkm?: string
}

export const fairblockLocalAccountAtom = atomWithStorage<FairblockLocalAccount>(
  'localFairblockKey:v1', // local storage key
  {},
  undefined,
  {
    unstable_getOnInit: true,
  }
)

export const addFairblockLocalAccountAtom = atom(
  null,
  (_get, set, { pkm }: { pkm: string }) => {
    set(fairblockLocalAccountAtom, () => {
      return {
        pkm,
      }
    })
  }
)

export interface FairblockState {
  readonly isLoading: boolean
  readonly currentBlockHeight: number | null
  readonly targetBlockHeightTyped: string | null
  readonly targetBlockHeightDisplayed: number | null
  readonly isEncrypting: boolean;
  readonly lastFairychainTxHash: string | null;
}

export const fairblockOrderStatus = atom((get) => get(fairblockAtom).isEncrypting ? 'encrypting' : null)

export const initFairblockState = () => ({
  currentBlockHeight: null,
  targetBlockHeightTyped: null,
  targetBlockHeightDisplayed: null,
  isLoading: false,
  isEncrypting: false,
  lastFairychainTxHash: null
})

export const { atom: fairblockAtom, updateAtom: updateFairblockAtom } = atomWithPartialUpdate(
  atom<FairblockState>(initFairblockState())
)

export const fairblockStore = createStore()
