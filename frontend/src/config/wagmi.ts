import { http, createConfig, createStorage } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { polkadotHubTestnet } from './chains'

export const config = createConfig({
  chains: [polkadotHubTestnet],
  connectors: [
    injected(),
  ],
  storage: createStorage({ storage: localStorage, key: 'ducket-wagmi' }),
  transports: {
    [polkadotHubTestnet.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
