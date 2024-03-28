import { OrderCreation } from '@cowprotocol/cow-sdk'

import { useMutation } from '@tanstack/react-query'

export const postToFairyringRelayer = async (
  order: OrderCreation,
  targetBlockHeight: number,
  apiUrl = process.env.FAIRYRING_URL_API_ROOT
) => {
  const rawResponse = await fetch(`${apiUrl}/submit-cowswap-order-to-fairyring`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      order,
      targetBlockHeight,
    }),
  })
  const submittedResponse = await rawResponse.json()
  return submittedResponse
}

export const usePostToFairyringRelayer = () => {
  const mutation = useMutation({
    mutationFn: ({
      order,
      targetBlockHeight,
      apiUrl,
    }: {
      order: OrderCreation
      targetBlockHeight: number
      apiUrl?: string
    }) => postToFairyringRelayer(order, targetBlockHeight, apiUrl),
  })

  return mutation
}
