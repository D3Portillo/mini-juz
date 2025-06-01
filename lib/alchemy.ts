import { Alchemy } from "alchemy-sdk"

export const alchemy = new Alchemy({
  url: "https://worldchain-mainnet.g.alchemy.com/v2/TydhRO71t-iaLkFdNDoQ_eIcd9TgKv0Q",
  connectionInfoOverrides: {
    skipFetchSetup: true, // Skip the initial fetch setup
  },
})
