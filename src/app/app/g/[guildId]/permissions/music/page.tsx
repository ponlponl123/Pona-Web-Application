"use client"
import React from "react"
import { useDiscordGuildInfo } from "@/contexts/discordGuildInfo"
import {
  ArrowCounterClockwiseIcon,
  ArrowsDownUpIcon,
  CaretRightIcon,
  GearIcon,
  Icon,
  MusicNotesMinusIcon,
  MusicNotesPlusIcon,
  PersonSimpleTaiChiIcon,
  SealCheckIcon,
  ShieldCheckIcon,
  SkipForwardIcon,
  UserCheckIcon,
  UserListIcon,
} from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { useAppStore } from "@/store/coreStore"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "react-smooth-input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  meter,
  MusicPermissionsPayload,
  VoteOptions,
} from "@/types/guild/permissions/music"
import {
  Default_Payload,
  Default_VoteToSkip,
} from "@/consts/guild/permissions/music"
import { Switch } from "@/components/ui/switch"
import { Alert } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { getPermissionLabel } from "@/lib/parser"

function Page() {
  const { guild } = useDiscordGuildInfo()
  const language = useAppStore((state) => state.language)
  const [permSettingPayload, setPermSettingPayload] =
    React.useState<MusicPermissionsPayload>(Default_Payload)
  const prevPermSettingPayload =
    React.useRef<MusicPermissionsPayload>(Default_Payload)
  const [loading, setLoading] = React.useState(false)

  const conditions: { label: string; value: meter }[] = [
    {
      label: language.data.app.guilds.permissions.music.condition.constant,
      value: "constant",
    },
    {
      label: language.data.app.guilds.permissions.music.condition.ratio,
      value: "ratio",
    },
  ]

  const tagMap: Record<string, string> = {
    "[add]": language.data.app.guilds.permissions.music.access.add,
    "[remove]": language.data.app.guilds.permissions.music.access.remove,
    "[move]": language.data.app.guilds.permissions.music.access.move,
  }

  const switchItems: {
    key: Extract<
      keyof MusicPermissionsPayload,
      "vote_to_skip" | "vote_to_remove" | "vote_to_add"
    >
    icon: Icon
    payload: VoteOptions
    default: VoteOptions
    l: {
      title: string
      description: string
      min: string
    }
  }[] = [
    {
      key: "vote_to_skip",
      icon: SkipForwardIcon,
      payload: permSettingPayload.vote_to_skip,
      default: Default_Payload.vote_to_skip,
      l: language.data.app.guilds.permissions.music.switch.vote_to_skip,
    },
    {
      key: "vote_to_remove",
      icon: MusicNotesMinusIcon,
      payload: permSettingPayload.vote_to_remove,
      default: Default_Payload.vote_to_remove,
      l: language.data.app.guilds.permissions.music.switch.vote_to_remove,
    },
    {
      key: "vote_to_add",
      icon: MusicNotesPlusIcon,
      payload: permSettingPayload.vote_to_add,
      default: Default_Payload.vote_to_add,
      l: language.data.app.guilds.permissions.music.switch.vote_to_add,
    },
  ]

  return (
    <main id="app-panel">
      <main id="app-workspace">
        {guild ? (
          <>
            <h1 className="text-base text-foreground/40">{guild.name}</h1>
            <h1 className="mt-4 flex items-center gap-4 text-5xl max-lg:text-4xl max-md:gap-2 max-md:text-3xl">
              <GearIcon weight="fill" className="size-12 max-md:size-6" />{" "}
              {language.data.app.guilds.permissions.title}{" "}
              <CaretRightIcon
                weight="bold"
                className="mt-2 size-4 max-md:-mx-1 max-md:size-3 md:mt-3"
              />{" "}
              {language.data.app.guilds.permissions.music.title}{" "}
              <Badge className="mt-2 -ml-1 rounded-md bg-primary/20 text-primary">
                {language.data.extensions.comingsoon}
              </Badge>
            </h1>
            <Alert className="mt-6 rounded-xl border-2 border-amber-400 bg-amber-400/10 tracking-wider text-amber-400 backdrop-blur-xs">
              {language.data.extensions.comingsoon}
            </Alert>
            <div className={cn(loading && "pointer-events-none opacity-40")}>
              <div className="h-6" />
              <h3 className="px-2 text-foreground/40">
                {
                  language.data.app.guilds.permissions.music.category
                    .permissions
                }
              </h3>
              <div className="guild-permission-setting-card">
                <div className="flex items-center gap-2 px-3 max-[32rem]:px-1">
                  <PersonSimpleTaiChiIcon weight="fill" className="size-4" />
                  <h1 className="text-lg">
                    {language.data.app.guilds.permissions.music.everyone.title}
                  </h1>
                </div>
                <p className="-mt-2 px-3 text-sm text-foreground/40 max-[32rem]:px-1">
                  {
                    language.data.app.guilds.permissions.music.everyone
                      .description
                  }
                </p>
                <div className="flex flex-wrap gap-2 rounded-lg border-2 border-border/10 bg-background/40 p-2">
                  {[...permSettingPayload.universal].map((v, i) => (
                    <Badge key={i} variant="secondary" className="chip">
                      {language.data.app.guilds.permissions.music.access[v] ??
                        language.data.common.unknown}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="guild-permission-setting-card">
                <div className="flex items-center gap-2 px-3 max-[32rem]:px-1">
                  <UserCheckIcon weight="fill" className="size-4" />
                  <h1 className="text-lg">
                    {
                      language.data.app.guilds.permissions.music.selector
                        .who_can_manage_queue.title
                    }
                  </h1>
                </div>
                <p className="-mt-2 px-3 text-sm text-foreground/40 max-[32rem]:px-1">
                  {language.data.app.guilds.permissions.music.selector.who_can_manage_queue.description
                    .split(/(\[add\]|\[remove\]|\[move\])/g)
                    .map((part, i) => {
                      if (tagMap[part]) {
                        return (
                          <Badge key={i} variant="secondary" className="chip">
                            {tagMap[part]}
                          </Badge>
                        )
                      }

                      return <span key={i}>{part}</span>
                    })}
                </p>
                <div className="flex flex-wrap gap-2 rounded-lg border-2 border-border/10 bg-background/40 p-2">
                  {[...permSettingPayload.who_can_manage_queue].map(
                    (permId, i) => (
                      <Badge key={i} variant="secondary" className="chip">
                        {getPermissionLabel(permId, language.data)}
                      </Badge>
                    )
                  )}
                </div>
              </div>
              <div className="guild-permission-setting-card">
                <div className="flex items-center gap-2 px-3 max-[32rem]:px-1">
                  <SealCheckIcon weight="fill" className="size-4" />
                  <h1 className="text-lg">
                    {
                      language.data.app.guilds.permissions.music.selector
                        .who_authorized_that_can_be_manage_queue_without_vote
                        .title
                    }
                  </h1>
                </div>
                <p className="-mt-2 px-3 text-sm text-foreground/40 max-[32rem]:px-1">
                  {
                    language.data.app.guilds.permissions.music.selector
                      .who_authorized_that_can_be_manage_queue_without_vote
                      .description
                  }
                </p>
                <div className="flex flex-wrap gap-2 rounded-lg border-2 border-border/10 bg-background/40 p-2">
                  {[...permSettingPayload.who_can_bypass_vote].map(
                    (permId, i) => (
                      <Badge key={i} variant="secondary" className="chip">
                        {getPermissionLabel(permId, language.data)}
                      </Badge>
                    )
                  )}
                </div>
              </div>
              <div className="h-6" />
              <h3 className="px-2 text-foreground/40">
                {language.data.app.guilds.permissions.music.category.allowed}
              </h3>
              <div className="m-1 flex h-max min-w-0 flex-3 flex-col overflow-hidden rounded-xl border-2 border-border/10 bg-background/40 backdrop-blur-xs">
                <FieldLabel
                  htmlFor={"toggle-can-everyone-remove-own-track"}
                  data-smooth-interaction="true"
                  className="flex h-max items-center justify-between gap-2 rounded-sm! border-0! bg-transparent p-3 text-foreground hover:bg-foreground/10 active:scale-96 max-[32rem]:px-1"
                >
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle className="flex items-center gap-2 text-lg [32rem]:px-1">
                        <UserListIcon weight="fill" className="size-4" />
                        {
                          language.data.app.guilds.permissions.music.switch
                            .can_everyone_remove_own_track.title
                        }
                      </FieldTitle>
                      <FieldDescription className="-mt-2 px-1 text-sm text-foreground/40">
                        {
                          language.data.app.guilds.permissions.music.switch
                            .can_everyone_remove_own_track.description
                        }
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      checked={permSettingPayload.can_everyone_remove_own_track}
                      onCheckedChange={(v) =>
                        setPermSettingPayload((prev) => ({
                          ...prev,
                          can_everyone_remove_own_track: v,
                        }))
                      }
                      id={"toggle-can-everyone-remove-own-track"}
                    />
                  </Field>
                </FieldLabel>
              </div>
              <div className="guild-permission-setting-card">
                <div className="flex items-center gap-2 px-3 max-[32rem]:px-1">
                  <MusicNotesPlusIcon weight="fill" className="size-4" />
                  <h1 className="text-lg">
                    {
                      language.data.app.guilds.permissions.music.selector
                        .who_can_add_track
                    }
                  </h1>
                </div>
                <div className="flex flex-wrap gap-2 rounded-lg border-2 border-border/10 bg-background/40 p-2">
                  {[...permSettingPayload.who_can_add_track].map(
                    (permId, i) => (
                      <Badge key={i} variant="secondary" className="chip">
                        {getPermissionLabel(permId, language.data)}
                      </Badge>
                    )
                  )}
                </div>
              </div>
              <div className="guild-permission-setting-card">
                <div className="flex items-center gap-2 px-3 max-[32rem]:px-1">
                  <MusicNotesMinusIcon weight="fill" className="size-4" />
                  <h1 className="text-lg">
                    {
                      language.data.app.guilds.permissions.music.selector
                        .who_can_remove_track
                    }
                  </h1>
                </div>
                <div className="flex flex-wrap gap-2 rounded-lg border-2 border-border/10 bg-background/40 p-2">
                  {[...permSettingPayload.who_can_remove_track].map(
                    (permId, i) => (
                      <Badge key={i} variant="secondary" className="chip">
                        {getPermissionLabel(permId, language.data)}
                      </Badge>
                    )
                  )}
                </div>
              </div>
              <div className="guild-permission-setting-card">
                <div className="flex items-center gap-2 px-3 max-[32rem]:px-1">
                  <ArrowsDownUpIcon weight="fill" className="size-4" />
                  <h1 className="text-lg">
                    {
                      language.data.app.guilds.permissions.music.selector
                        .who_can_move_track
                    }
                  </h1>
                </div>
                <div className="flex flex-wrap gap-2 rounded-lg border-2 border-border/10 bg-background/40 p-2">
                  {[...permSettingPayload.who_can_move_track].map(
                    (permId, i) => (
                      <Badge key={i} variant="secondary" className="chip">
                        {getPermissionLabel(permId, language.data)}
                      </Badge>
                    )
                  )}
                </div>
              </div>
              <div className="h-6" />
              <h3 className="px-2 text-foreground/40">
                {language.data.app.guilds.permissions.music.category.votes}
              </h3>
              {switchItems.map((a, i) => (
                <div
                  key={"switch-" + i}
                  className="m-1 flex h-max min-w-0 flex-3 flex-col overflow-hidden rounded-xl border-2 border-border/10 bg-background/40 backdrop-blur-xs"
                >
                  <FieldLabel
                    htmlFor={"toggle-" + a.key}
                    data-smooth-interaction="true"
                    className="flex h-max items-center justify-between gap-2 rounded-sm! border-0! bg-transparent p-3 text-foreground hover:bg-foreground/10 active:scale-96 max-[32rem]:px-1"
                  >
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle className="flex items-center gap-2 text-lg [32rem]:px-1">
                          <a.icon weight="fill" className="size-4" />
                          {a.l.title}
                        </FieldTitle>
                        <FieldDescription className="-mt-2 px-1 text-sm text-foreground/40">
                          {a.l.description}
                        </FieldDescription>
                      </FieldContent>
                      <Switch
                        checked={a.payload.enabled}
                        onCheckedChange={(v) =>
                          setPermSettingPayload((prev) => ({
                            ...prev,
                            [a.key]: { ...prev[a.key], enabled: v },
                          }))
                        }
                        id={"toggle-" + a.key}
                      />
                    </Field>
                  </FieldLabel>
                  <div
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-lg border-t-2 border-border/10 bg-background/40 p-3 max-[32rem]:flex-col",
                      !a.payload.enabled && "pointer-events-none opacity-40"
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 max-[32rem]:w-full [32rem]:px-3">
                      <p className="text-sm text-foreground/40">{a.l.min}</p>
                      <Badge className="rounded-full bg-foreground/10 text-xs text-foreground/40">
                        {language.data.common.default}:{" "}
                        {a.payload.type === "constant"
                          ? a.default.min
                          : a.default.ratio}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-end gap-1 max-[32rem]:w-full max-[32rem]:flex-row-reverse [32rem]:max-sm:flex-col-reverse">
                      <Field className="flex w-max flex-row items-center gap-3 max-[32rem]:gap-1.5 [32rem]:justify-end">
                        {a.payload.type === "ratio" && (
                          <div className="flex w-max items-center justify-end gap-3 text-foreground/40 max-[32rem]:ml-2.5 max-[32rem]:gap-1.5">
                            <span>1</span>
                            <span>/</span>
                          </div>
                        )}
                        <Input
                          id={"input-" + a.key}
                          type="text"
                          placeholder="2"
                          classNames={{
                            base: "w-14 bg-input/20!",
                          }}
                          value={
                            a.payload.type === "constant"
                              ? a.payload.min
                              : a.payload.ratio
                          }
                          disabled={!a.payload.enabled}
                          onChange={({ target: { value: v } }) => {
                            if (v !== "" && !/^\d+$/.test(v)) return
                            const k =
                              a.payload.type === "constant" ? "min" : "ratio"
                            setPermSettingPayload((p) => ({
                              ...p,
                              [a.key]: {
                                ...p[a.key],
                                [k]: v === "" ? "" : +v,
                              },
                            }))
                          }}
                          fontStyle={{
                            fontFamily:
                              "var(--font-ponlponl123-article), var(--font-sn-sanafon-maru-j30), sans-serif",
                            fontWeight: "bold",
                            fontSize: "14px",
                            letterSpacing: "1px",
                          }}
                        />
                      </Field>
                      <Select
                        items={conditions}
                        value={a.payload.type}
                        onValueChange={(v) =>
                          setPermSettingPayload((prev) => ({
                            ...prev,
                            [a.key]: {
                              ...prev[a.key],
                              type: v as meter,
                            },
                          }))
                        }
                        disabled={!a.payload.enabled}
                      >
                        <SelectTrigger
                          data-smooth-interaction="true"
                          className="m-0 h-9! w-max rounded-xl border-2 border-transparent bg-input/20! hover:bg-input/30!"
                        >
                          <SelectValue
                            className="w-max"
                            placeholder={
                              language.data.app.guilds.permissions.music
                                .condition.meter
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="rounded-md border-2 bg-card">
                          <SelectGroup>
                            {conditions.map((item) => (
                              <SelectItem
                                key={item.value}
                                className="text-foreground hover:bg-primary hover:text-primary-foreground data-highlighted:bg-primary data-highlighted:text-primary-foreground"
                                value={item.value}
                              >
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
              <div className="h-6" />
              <div className="flex w-full items-center justify-between gap-3 p-3">
                <div>
                  <Button
                    className={cn(
                      "flex h-max items-center gap-2 rounded-4xl bg-foreground/5 px-5 py-3 text-foreground/30",
                      permSettingPayload !== Default_Payload &&
                        "bg-primary/30 text-primary-foreground/70"
                    )}
                    data-smooth-interaction="true"
                    onClick={() => setPermSettingPayload(Default_Payload)}
                  >
                    <ArrowCounterClockwiseIcon weight="bold" />
                    {language.data.common.restore}
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    className="flex h-max items-center gap-2 rounded-4xl px-5 py-3"
                    data-smooth-interaction="true"
                  >
                    {loading ? <Spinner /> : <ShieldCheckIcon weight="fill" />}
                    {language.data.common.apply}
                  </Button>
                  <Button
                    className="flex h-max items-center gap-2 rounded-4xl bg-foreground/10 px-5 py-3 text-foreground/60"
                    data-smooth-interaction="true"
                    onClick={() =>
                      setPermSettingPayload(prevPermSettingPayload.current)
                    }
                  >
                    {language.data.common.cancel}
                  </Button>
                </div>
              </div>
              <div className="h-6" />
            </div>
          </>
        ) : (
          <>
            <Spinner />
          </>
        )}
      </main>
    </main>
  )
}

export default Page
