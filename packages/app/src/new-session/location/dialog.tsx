import { Dialog, DialogBody } from "@opencode/ui/dialog"
import { useDialog } from "@opencode/ui/context/dialog"
import { Icon } from "@opencode/ui/icon"
import { Keybind } from "@opencode/ui/keybind"
import {
  displayName,
  getProjectAvatarSource,
  getProjectAvatarVariant,
  ProjectAvatar,
} from "@opencode/ui/project-avatar"
import { ScrollView } from "@opencode/ui/scroll-view"
import { TextInput } from "@opencode/ui/text-input"
import { getFilename, sameDirectory } from "@opencode/util/path"
import { createEffect, createMemo, createResource, For, Match, onCleanup, Show, Switch } from "solid-js"
import { createStore } from "solid-js/store"
import type { PromptProject, PromptProjectController } from "@/new-session/project/selector"
import type { NewSessionWorkspaceController } from "@/new-session/workspace/controller"
import { useLanguage } from "@/runtime/i18n/language"
import { useServerSDK } from "@/runtime/server/client"
import { ServerConnection, useServers } from "@/runtime/server/registry"
import { useGlobal } from "@/runtime/server/runtime"
import { workspaceSelectionDirectories } from "@/workspaces/paths"
import "@/shell/commands/dialog.css"
import "./dialog.css"

type LocationEntry =
  | { id: string; type: "project"; group: string; project: PromptProject }
  | { id: string; type: "add"; group: string; server?: string }
  | { id: string; type: "workspace"; group: string; value: string; directory: string }

/** Opens the new-session location dialog: projects first, and → on a Git project lists where the session can run. */
export function useNewSessionLocationDialog(input: {
  project: PromptProjectController
  workspace: NewSessionWorkspaceController
  onDone: () => void
}) {
  const dialog = useDialog()

  return (options?: { onWorkspace?: (value: string) => void }) => {
    void dialog.show(
      () => (
        <NewSessionLocationDialog
          project={input.project}
          workspace={input.workspace}
          onWorkspace={options?.onWorkspace}
        />
      ),
      input.onDone,
    )
  }
}

function NewSessionLocationDialog(props: {
  project: PromptProjectController
  workspace: NewSessionWorkspaceController
  onWorkspace?: (value: string) => void
}) {
  const dialog = useDialog()
  const language = useLanguage()
  const global = useGlobal()
  const servers = useServers()
  const serverSDK = useServerSDK()
  const [store, setStore] = createStore<{
    drilled?: PromptProject
    query: string
    active?: string
    /** The projects view to restore when stepping back out of a project. */
    back?: { query: string; active: string }
  }>({ query: "" })

  const connection = (project: PromptProject) =>
    project.server ? servers.list.find((item) => ServerConnection.key(item) === project.server!.key) : serverSDK.server

  const context = (project: PromptProject) => {
    const target = connection(project)

    return target ? global.ensureServerCtx(target) : undefined
  }

  const [listed, listedActions] = createResource(
    () => store.drilled,
    (project) =>
      context(project)
        ?.sdk.api.worktree.list({ projectID: project.id! })
        .catch(() => project.worktrees ?? []) ?? Promise.resolve(project.worktrees ?? []),
  )

  onCleanup(
    serverSDK.event.listen((event) => {
      if (event.type === "worktree.updated" && event.data.projectID === store.drilled?.id) void listedActions.refetch()
    }),
  )

  const matches = (...values: (string | undefined)[]) => {
    const query = store.query.trim().toLowerCase()

    return !query || values.some((value) => value?.toLowerCase().includes(query))
  }

  const projectEntries = createMemo<LocationEntry[]>(() => {
    const grouped = props.project.servers().length > 1
    const projects = props.project
      .projects()
      .filter((project) => matches(displayName(project), project.worktree))
      .map((project) => ({
        id: `project:${project.server?.key ?? ""}:${project.worktree}`,
        type: "project" as const,
        group: grouped ? project.server!.name : language.t("home.projects"),
        project,
      }))

    if (!grouped) return [...projects, { id: "add", type: "add" as const, group: language.t("home.projects") }]

    // Projects keep their server grouping; adding a project stays one row per server at the end.
    return [
      ...props.project
        .servers()
        .flatMap((server) => projects.filter((entry) => entry.project.server?.key === server.key)),
      ...props.project.servers().map((server) => ({
        id: `add:${server.key}`,
        type: "add" as const,
        group: language.t("session.new.project.add"),
        server: server.key,
      })),
    ]
  })

  const workspaceEntries = createMemo<LocationEntry[]>(() => {
    const project = store.drilled

    if (!project) return []
    const group = language.t("session.new.workspace.runIn")
    const directories = workspaceSelectionDirectories(project, listed.latest ?? project.worktrees ?? [])

    return [
      { id: "main", type: "workspace" as const, group, value: "main", directory: project.worktree },
      ...directories.map((directory) => ({
        id: `worktree:${directory}`,
        type: "workspace" as const,
        group,
        value: directory,
        directory,
      })),
      { id: "create", type: "workspace" as const, group, value: "create", directory: project.worktree },
    ].filter((entry) => matches(workspaceTitle(project, entry.value), entry.directory))
  })

  const entries = () => (store.drilled ? workspaceEntries() : projectEntries())
  const groups = createMemo(() =>
    entries().reduce<{ group: string; entries: LocationEntry[] }[]>((all, entry) => {
      const last = all.at(-1)

      if (last?.group === entry.group) last.entries.push(entry)

      if (last?.group !== entry.group) all.push({ group: entry.group, entries: [entry] })

      return all
    }, []),
  )

  const currentEntry = () =>
    entries().find((entry) => {
      if (entry.type === "project") return props.project.isSelected(entry.project)

      if (entry.type === "workspace") return isCurrentWorkspace(entry)

      return false
    })

  // Follow the current location, then the first result, until the user explicitly chooses a row.
  const activeEntry = createMemo(
    () =>
      entries().find((entry) => entry.id === store.active) ??
      (store.query.trim() ? undefined : currentEntry()) ??
      entries()[0],
  )

  let resultsRef: HTMLDivElement | undefined
  let inputRef: HTMLInputElement | undefined

  createEffect(() => {
    if (!activeEntry()) return
    const frame = requestAnimationFrame(() =>
      resultsRef?.querySelector("[data-active]")?.scrollIntoView({ block: "nearest" }),
    )
    onCleanup(() => cancelAnimationFrame(frame))
  })

  function workspaceTitle(project: PromptProject, value: string) {
    if (value === "main") return getFilename(project.worktree)

    if (value === "create") return language.t("workspace.new")

    return getFilename(value)
  }

  function isCurrentWorkspace(entry: Extract<LocationEntry, { type: "workspace" }>) {
    if (!store.drilled || !props.project.isSelected(store.drilled)) return false
    const current = props.workspace.selection.value()

    if (entry.value === "main" || entry.value === "create") return current === entry.value

    return current !== "main" && current !== "create" && sameDirectory(current, entry.value)
  }

  function drill(project: PromptProject) {
    setStore({
      drilled: project,
      query: "",
      active: undefined,
      back: { query: store.query, active: `project:${project.server?.key ?? ""}:${project.worktree}` },
    })
    inputRef?.focus()
  }

  function back() {
    const project = store.drilled

    setStore({
      drilled: undefined,
      query: store.back?.query ?? "",
      active: store.back?.active ?? (project ? `project:${project.server?.key ?? ""}:${project.worktree}` : undefined),
      back: undefined,
    })
    inputRef?.focus()
  }

  function choose(entry: LocationEntry | undefined) {
    if (!entry) return

    if (entry.type === "add") {
      dialog.close()
      props.project.add(entry.server)

      return
    }

    if (entry.type === "project") {
      props.project.select(entry.project)
      dialog.close()

      return
    }

    const project = store.drilled

    if (!project) return

    if (props.project.isSelected(project)) props.workspace.selection.set(entry.value)

    if (!props.project.isSelected(project)) props.project.select(project, entry.value)
    props.onWorkspace?.(entry.value)
    dialog.close()
  }

  const move = (delta: -1 | 1) => {
    const list = entries()

    if (list.length === 0) return
    const index = list.findIndex((entry) => entry.id === activeEntry()?.id)
    setStore("active", list[(index + delta + list.length) % list.length].id)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    const target = event.currentTarget as HTMLInputElement
    const atEnd = target.selectionStart === target.value.length && target.selectionEnd === target.value.length
    const atStart = target.selectionStart === 0 && target.selectionEnd === 0
    const active = activeEntry()

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      move(event.key === "ArrowDown" ? 1 : -1)

      return
    }

    if (event.key === "Enter" && !event.isComposing) {
      event.preventDefault()
      choose(active)

      return
    }

    if (event.key === "ArrowRight" && atEnd && active?.type === "project" && drillable(active.project)) {
      event.preventDefault()
      drill(active.project)

      return
    }

    if (store.drilled && ((event.key === "ArrowLeft" && atStart) || (event.key === "Backspace" && !target.value))) {
      event.preventDefault()
      back()
    }
  }

  return (
    <Dialog class="command-palette" size="large">
      <DialogBody class="command-palette-body">
        <div class="command-palette-search">
          <TextInput
            ref={inputRef}
            value={store.query}
            autofocus
            autocomplete="off"
            spellcheck={false}
            appearance="large"
            aria-label={
              store.drilled
                ? language.t("session.new.workspace.search.placeholder")
                : language.t("session.new.project.search")
            }
            placeholder={
              store.drilled
                ? language.t("session.new.workspace.search.placeholder")
                : language.t("session.new.project.search")
            }
            leadingIcon={
              <Show when={store.drilled} fallback={<Icon name="magnifying-glass" />}>
                {(project) => (
                  <button
                    type="button"
                    class="flex h-6 max-w-[200px] items-center gap-1.5 rounded-sm bg-v2-background-bg-base px-1.5 text-13-medium text-v2-text-text-base shadow-[var(--v2-elevation-raised)]"
                    aria-label={language.t("session.new.location.back")}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={back}
                  >
                    <ProjectAvatar
                      class="shrink-0"
                      fallback={displayName(project())}
                      src={getProjectAvatarSource(project().id, project().icon)}
                      variant={getProjectAvatarVariant(project().icon?.color)}
                    />
                    <span class="min-w-0 truncate">{displayName(project())}</span>
                  </button>
                )}
              </Show>
            }
            onInput={(event) => setStore({ query: event.currentTarget.value, active: undefined })}
            onKeyDown={handleKeyDown}
          />
        </div>
        <ScrollView class="command-palette-scroll" viewportRef={(el) => (resultsRef = el)}>
          <div class="command-palette-results" role="listbox">
            <Show
              when={entries().length > 0}
              fallback={
                <div class="command-palette-state">
                  {store.drilled && listed.loading ? language.t("common.loading") : language.t("palette.empty")}
                </div>
              }
            >
              <For each={groups()}>
                {(group) => (
                  <div class="command-palette-group">
                    <div class="command-palette-group-title">{group.group}</div>
                    <For each={group.entries}>
                      {(entry) => (
                        <button
                          type="button"
                          class="command-palette-row"
                          role="option"
                          aria-selected={activeEntry()?.id === entry.id}
                          data-active={activeEntry()?.id === entry.id ? "" : undefined}
                          onMouseMove={(event) => {
                            // Ignore hover from a static cursor when keyboard scrolling moves rows underneath it.
                            if (event.movementX === 0 && event.movementY === 0) return
                            setStore("active", entry.id)
                          }}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => choose(entry)}
                        >
                          <Switch>
                            <Match when={entry.type === "project" && entry}>
                              {(item) => (
                                <ProjectRow
                                  project={item().project}
                                  path={item().project.worktree}
                                  onDrill={drillable(item().project) ? () => drill(item().project) : undefined}
                                  drillLabel={language.t("session.new.location.worktrees")}
                                />
                              )}
                            </Match>
                            <Match when={entry.type === "add" && entry}>
                              {(item) => (
                                <div class="command-palette-row-main">
                                  <Icon name="plus" class="command-palette-row-icon" />
                                  <div class="command-palette-row-text">
                                    <span class="command-palette-title">{language.t("session.new.project.add")}</span>
                                    <Show when={item().server && props.project.servers().length > 1}>
                                      <span class="command-palette-description">
                                        {props.project.servers().find((server) => server.key === item().server)?.name}
                                      </span>
                                    </Show>
                                  </div>
                                </div>
                              )}
                            </Match>
                            <Match when={entry.type === "workspace" && store.drilled && entry}>
                              {(item) => (
                                <WorkspaceRow
                                  title={workspaceTitle(store.drilled!, item().value)}
                                  value={item().value}
                                  description={
                                    item().value === "create"
                                      ? language.t("session.new.workspace.new.tooltip")
                                      : item().directory
                                  }
                                />
                              )}
                            </Match>
                          </Switch>
                        </button>
                      )}
                    </For>
                  </div>
                )}
              </For>
            </Show>
          </div>
        </ScrollView>
        <div class="new-session-location-hints">
          <span>
            <Keybind keys={["↵"]} variant="neutral" />
            {language.t("session.new.location.select")}
          </span>
          <Show
            when={store.drilled}
            fallback={
              <span>
                <Keybind keys={["→"]} variant="neutral" />
                {language.t("session.new.location.worktrees")}
              </span>
            }
          >
            <span>
              <Keybind keys={["←"]} variant="neutral" />
              {language.t("session.new.location.back")}
            </span>
          </Show>
        </div>
      </DialogBody>
    </Dialog>
  )
}

function ProjectRow(props: { project: PromptProject; path: string; onDrill?: () => void; drillLabel: string }) {
  return (
    <>
      <div class="command-palette-row-main">
        <ProjectAvatar
          class="shrink-0"
          fallback={displayName(props.project)}
          src={getProjectAvatarSource(props.project.id, props.project.icon)}
          variant={getProjectAvatarVariant(props.project.icon?.color)}
        />
        <div class="command-palette-row-text">
          <span class="command-palette-title">{displayName(props.project)}</span>
          <span class="command-palette-description" dir="ltr">
            {props.path}
          </span>
        </div>
      </div>
      <Show when={props.onDrill}>
        {(onDrill) => (
          <span
            role="button"
            aria-label={props.drillLabel}
            class="new-session-location-drill"
            onClick={(event) => {
              event.stopPropagation()
              onDrill()()
            }}
          >
            <Icon name="chevron-right" size="small" />
          </span>
        )}
      </Show>
    </>
  )
}

function WorkspaceRow(props: { title: string; value: string; description: string }) {
  return (
    <>
      <div class="command-palette-row-main">
        <Icon
          name={props.value === "main" ? "monitor" : props.value === "create" ? "plus" : "outline-worktree"}
          class="command-palette-row-icon"
          classList={{ "!text-v2-icon-icon-accent": props.value !== "main" && props.value !== "create" }}
        />
        <div class="command-palette-row-text">
          <span class="command-palette-title">{props.title}</span>
          <span class="command-palette-description" dir="ltr">
            {props.description}
          </span>
        </div>
      </div>
    </>
  )
}

function drillable(project: PromptProject) {
  return !!project.id && project.vcs === "git"
}
