import { atom } from "jotai"
import { HTTP_PonaCommonStateWithTracks, Queue } from "@/types/ponaPlayer"

export const playbackAtom = atom<number>(0)

export const ponaCommonStateAtom = atom<HTTP_PonaCommonStateWithTracks | null>(
  null
)

export const queueAtom = atom<{ queue: Queue | null; updating: boolean }>({
  queue: null,
  updating: false,
})
