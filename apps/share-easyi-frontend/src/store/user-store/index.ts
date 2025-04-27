import type { Peer } from "peerjs"
import { create } from "zustand"

export const useUserStore = create(() => ({
    peer: null as Peer | null,
}))
