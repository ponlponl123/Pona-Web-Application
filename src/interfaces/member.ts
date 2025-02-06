import { VoiceBasedChannel } from "discord.js";

export interface MemberVoiceChangedState {
    oldVC: VoiceBasedChannel | null;
    newVC: VoiceBasedChannel | null;
    isUserJoined: boolean;
    isUserSwitched: boolean;
    isUserLeaved: boolean;
}