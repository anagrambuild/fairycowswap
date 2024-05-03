import { atom, createStore } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'

interface FairblockLocalAccount {
  pkm?: string
}

export const fairblockLocalAccountAtom = atomWithStorage<FairblockLocalAccount>(
  'localFairblockKey:v1', // local storage key
  {},
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
}

export const initFairblockState = () => ({
  currentBlockHeight: null,
  targetBlockHeightTyped: null,
  targetBlockHeightDisplayed: null,
  isLoading: false,
  isEncrypting: false,
})

export const { atom: fairblockAtom, updateAtom: updateFairblockAtom } = atomWithPartialUpdate(
  atom<FairblockState>(initFairblockState())
)

export const fairblockStore = createStore()
