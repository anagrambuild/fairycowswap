import { atom, createStore } from 'jotai'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'

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