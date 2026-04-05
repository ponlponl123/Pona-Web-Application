export type meter = "constant" | "ratio"

export type access = "add" | "remove" | "remove_own" | "move"

export type member = "everyone" | "owner" | string

export type role = "administrator" | string

export interface VoteOptions {
  enabled: boolean
  type: meter
  min: number
  ratio: number
}

export interface MusicPermissionsPayload {
  universal: Set<access>
  who_can_manage_queue: Set<member | role>
  who_can_add_track: Set<member | role>
  who_can_remove_track: Set<member | role>
  who_can_move_track: Set<member | role>
  can_everyone_remove_own_track: boolean
  vote_to_skip: VoteOptions
  vote_to_remove: VoteOptions
  vote_to_add: VoteOptions
}
