import {
  access,
  member,
  MusicPermissionsPayload,
  role,
  VoteOptions,
} from "@/types/guild/permissions/music"

const Default_VoteToSkip: VoteOptions = {
  enabled: true,
  type: "ratio",
  min: 5,
  ratio: 2,
}

const Default_VoteToRemove: VoteOptions = {
  enabled: false,
  type: "ratio",
  min: 5,
  ratio: 2,
}

const Default_VoteToAdd: VoteOptions = {
  enabled: false,
  type: "ratio",
  min: 5,
  ratio: 2,
}

export const Default_Payload: MusicPermissionsPayload = {
  universal: new Set<access>(["add", "remove", "move"]),
  who_can_manage_queue: new Set<member | role>(["everyone"]),
  who_can_add_track: new Set<member | role>(["everyone"]),
  who_can_remove_track: new Set<member | role>(["everyone"]),
  who_can_move_track: new Set<member | role>(["everyone"]),
  can_everyone_remove_own_track: true,
  vote_to_skip: Default_VoteToSkip,
  vote_to_remove: Default_VoteToRemove,
  vote_to_add: Default_VoteToAdd,
}

export { Default_VoteToAdd, Default_VoteToRemove, Default_VoteToSkip }
