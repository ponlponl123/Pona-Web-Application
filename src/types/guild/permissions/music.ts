export type meter = "constant" | "ratio"

export type access = "add" | "remove" | "remove_own" | "move"

export type MemberMention = `<@${number}>`

export type RoleMention = `<@&${number}>`

export type NoOne = "noone"

export type Member = "everyone" | "owner" | MemberMention

export type Role = "administrator" | RoleMention

export type UnifiedMemberRole = Member | Role | NoOne

export interface VoteOptions {
  enabled: boolean
  type: meter
  min: number
  ratio: number
}

export interface MusicPermissionsPayload {
  universal: Set<access>
  who_can_manage_queue: Set<UnifiedMemberRole>
  who_can_add_track: Set<UnifiedMemberRole>
  who_can_remove_track: Set<UnifiedMemberRole>
  who_can_move_track: Set<UnifiedMemberRole>
  who_can_bypass_vote: Set<UnifiedMemberRole>
  can_everyone_remove_own_track: boolean
  vote_to_skip: VoteOptions
  vote_to_remove: VoteOptions
  vote_to_add: VoteOptions
}
