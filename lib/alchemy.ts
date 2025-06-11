import { Alchemy } from "alchemy-sdk"
export const ALCHEMY_RPC = {
  ws: "wss://worldchain-mainnet.g.alchemy.com/v2/TydhRO71t-iaLkFdNDoQ_eIcd9TgKv0Q",
  http: "https://worldchain-mainnet.g.alchemy.com/v2/TydhRO71t-iaLkFdNDoQ_eIcd9TgKv0Q",
} as const

export const alchemy = new Alchemy({
  url: ALCHEMY_RPC.http,
  connectionInfoOverrides: {
    skipFetchSetup: true, // Skip the initial fetch setup
  },
})
