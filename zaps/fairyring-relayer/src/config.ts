import { readFile } from "fs/promises";

export const getTemporalCloudClientCrt = async (): Promise<Buffer> => {
  if (process.env.IS_RENDER === 'true') {
    const crt = await readFile("/etc/secrets/client.pem");
    return crt;
  }
  const crt = await readFile("client.pem");
  return crt;
};

export const getTemporalCloudClientKey = async (): Promise<Buffer> => {
  if (process.env.IS_RENDER === 'true') {
    const crt = await readFile("/etc/secrets/client.key");
    return crt;
  }
  const key = await readFile("client.key");
  return key;
};

export const getTemporalCloudAppNamespace = (): string => {
  if (process.env.IS_RENDER === 'true') {
    return process.env.TEMPORAL_CLOUD_APP_NAMESPACE!;
  }
  return process.env.TEMPORAL_CLOUD_APP_NAMESPACE!;
}

export const getTemporalCloudAppAddress = (): string => {
  if (process.env.IS_RENDER === 'true') {
    return process.env.TEMPORAL_CLOUD_APP_ADDRESS!;
  }
  return process.env.TEMPORAL_CLOUD_APP_ADDRESS!;
}


export const FAIRYRING_COWSWAP_SYNC_TASK_QUEUE = 'fairyring-cowswap-relay-pull-and-post-orders'
export const FAIRYRING_COWSWAP_SYNC_WORKFLOW_ID = 'fairyring-cowswap-relay-order-sync-workflow'

export const FAIRYRING_TESTNET_RPC_URL = 'https://testnet-rpc.fairblock.network'
export const FAIRYRING_TESTNET_API_URL = 'https://testnet-api.fairblock.network'
export const FAIRYRING_TESTNET_CHAIN_ID = 'fairyring-testnet-1'