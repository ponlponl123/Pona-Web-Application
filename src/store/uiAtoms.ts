import { atom } from "jotai"
import { VoiceBasedChannel } from "discord.js"
import { FullscreenMode } from "@/types/settings"

// High-Frequency State
export const playbackAtom = atom<number>(0)

// Sockets
export const socketRequestingAtom = atom<boolean>(false)

// VC
export const isMemberInVCAtom = atom<VoiceBasedChannel | null>(null)
export const isSameVCAtom = atom<boolean>(false)

// UI Modals
export const isFullscreenModeAtom = atom<FullscreenMode>(false)
export const isLanguageModalOpenAtom = atom<boolean>(false)
export const isSettingModalOpenAtom = atom<boolean>(false)
export const isFeedbackModalOpenAtom = atom<boolean>(false)
export const settingLayoutIdAtom = atom<string>("setting-modal")
export const playerPopupAtom = atom<boolean>(false)
export const isQueueReorderingAtom = atom<boolean>(false)
export const navOpenedAtom = atom<boolean>(false)
