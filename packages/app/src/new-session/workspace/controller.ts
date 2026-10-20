import { debounce } from "@solid-primitives/scheduled"
import { createEffect, createMemo, createResource, onCleanup } from "solid-js"
import { createStore } from "solid-js/store"
import { useWorkspaceLocation } from "@/workspaces/location"
import { useServerSDK } from "@/runtime/server/client"
import { useData } from "@/runtime/server/current"
import { useSettings } from "@/settings/model"
import { useTabs } from "@/shell/tabs/tabs"
import { ServerConnection } from "@/runtime/server/registry"
import { normalizeProjectInfo } from "@/runtime/server/global-sync/utils"
import { sameDirectory } from "@opencode/util/path"
import {
  isWorkspaceDirectory,
  isWorkspaceSelection,
  workspaceDefaultSelection,
  workspaceSelectionDestination,
  workspaceSelectionDirectories,
} from "@/workspaces/paths"

export function resolveNewSessionWorktree(input: { enabled: boolean; selected?: string; fallback?: string }) {
  if (!input.enabled) return "main"

  if (input.selected) return input.selected

  return input.fallback ?? "main"
}

export function resolveNewSessionBranch(input: {
  worktree: string
  directory: string
  createBranch?: string
  worktreeBranch: (worktree: string) => string | undefined
}) {
  if (input.worktree === "create" && input.createBranch) return input.createBranch
  const directory = input.worktree === "main" || input.worktree === "create" ? input.directory : input.worktree

  return input.worktreeBranch(directory)
}

export function resolveNewSessionGit(input: { projectVcs?: string; branch?: string }) {
  return input.projectVcs === "git" || input.branch !== undefined
}

export function cycleNewSessionWorktree(input: { current: string; existing?: string }) {
  if (input.current === "main") return "create"

  if (input.current === "create") return input.existing ?? "main"

  return "main"
}

export function createNewSessionWorkspaceController(input: {
  selectedWorktree: () => string | undefined
  selectedBranch: () => string | undefined
  setSelectedWorktree: (worktree: string | undefined) => void
  setSelectedBranch: (branch: string | undefined) => void
}) {
  const sdk = useWorkspaceLocation()
  const serverSDK = useServerSDK()
  const data = useData()
  const settings = useSettings()
  const tabs = useTabs()

  const [state, setState] = createStore({
    branchesOpen: false,
    search: "",
    existing: undefined as { projectID: string; directory: string } | undefined,
  })

  const searchBranches = debounce((search: string) => setState("search", search.trim()), 100)
  onCleanup(searchBranches.clear)

  const currentProject = createMemo(() => {
    const projectID = data.location.info({ directory: sdk().directory })?.project.id
    const current = projectID ? data.project.get(projectID) : undefined

    return current ? normalizeProjectInfo(current) : undefined
  })

  const worktreeSource = createMemo(
    () => {
      const project = currentProject()

      return project ? { projectID: project.id, directory: project.worktree } : undefined
    },
    undefined,
    { equals: (a, b) => a?.projectID === b?.projectID && a?.directory === b?.directory },
  )

  const [worktrees, worktreeActions] = createResource(worktreeSource, async (source) => ({
    projectID: source.projectID,
    items: await serverSDK.api.worktree
      .list({ projectID: source.projectID })
      .catch(() => (currentProject()?.id === source.projectID ? currentProject()?.worktrees : undefined) ?? []),
  }))

  onCleanup(
    serverSDK.event.listen((event) => {
      if (event.type === "worktree.updated" && event.data.projectID === currentProject()?.id)
        void worktreeActions.refetch()
    }),
  )
  // `latest` only skips Suspense once the resource has resolved at least once. Before that it
  // behaves like a plain read, which holds the transition that opens the New Session tab until
  // the worktree list returns.
  const worktreesLoaded = () => worktrees.state === "ready" || worktrees.state === "refreshing"

  const worktreeItems = createMemo(() => {
    const project = currentProject()

    if (!project) return []

    if (!worktreesLoaded()) return project.worktrees
    const loaded = worktrees.latest

    return loaded?.projectID === project.id ? loaded.items : project.worktrees
  })

  const worktreeDirectories = createMemo(() => {
    const project = currentProject()

    if (!project) return []

    return workspaceSelectionDirectories(project, worktreeItems())
  })

  const managedWorktrees = createMemo(() => {
    const project = currentProject()

    if (!project) return 0

    return worktreeItems().filter(
      (item) => item.strategy !== undefined && !sameDirectory(project.worktree, item.directory),
    ).length
  })

  const visible = createMemo(() =>
    resolveNewSessionGit({
      projectVcs: currentProject()?.vcs,
      branch: data.location.vcs.info({ directory: sdk().directory })?.branch.current,
    }),
  )

  const selected = createMemo(() => {
    const project = currentProject()
    const worktree = input.selectedWorktree()

    if (!project || !worktree) return

    if (isWorkspaceSelection(project, worktree)) return worktree

    // A saved choice may only exist in the server inventory. Keep it until the list can confirm it,
    // otherwise the selector falls back to Local while loading and a submit would target the wrong directory.
    if (!worktreesLoaded()) return worktree

    return worktreeDirectories().some((item) => sameDirectory(item, worktree)) ? worktree : undefined
  })

  const fallback = createMemo(() => {
    const project = currentProject()

    if (!project) return "main"

    return workspaceDefaultSelection(
      settings.workspaces.defaultDestination(),
      settings.workspaces.lastUsed(serverSDK.scope, project.id),
    )
  })

  const value = createMemo(() =>
    resolveNewSessionWorktree({
      enabled: visible(),
      selected: selected(),
      fallback: fallback(),
    }),
  )

  const projectRoot = createMemo(() => currentProject()?.worktree ?? sdk().directory)
  const branchDirectory = () => (value() === "create" ? projectRoot() : sdk().directory)

  const [branches, branchActions] = createResource(
    () =>
      state.branchesOpen && value() === "create" && visible()
        ? { directory: projectRoot(), search: state.search }
        : undefined,
    async (source) =>
      serverSDK.api.vcs.branch
        .list({ location: { directory: source.directory }, search: source.search, limit: 50 })
        .then((response) => ({ ...source, items: response.data, failed: false }))
        .catch(() => ({ ...source, items: [], failed: true })),
  )

  // Branch search must not suspend the draft or expose another project's previous results.
  const branchResults = () => {
    if (branches.state !== "ready" && branches.state !== "refreshing") return
    const loaded = branches.latest

    return loaded?.directory === projectRoot() && loaded.search === state.search ? loaded : undefined
  }

  createEffect(() => {
    void Promise.all([
      data.location.syncInfo({ directory: sdk().directory }),
      data.project.sync(),
      data.location.vcs.sync({ directory: sdk().directory }),
    ]).catch(() => undefined)
  })
  createEffect(() => {
    if (value() !== "create" || sameDirectory(projectRoot(), sdk().directory)) return
    void data.location.vcs.sync({ directory: projectRoot() }).catch(() => undefined)
  })
  // Only the selected worktree feeds the branch label. Syncing every worktree in the inventory boots
  // each one on the server, which then emits `agent.updated` and makes the client run the full
  // catalog fan-out for every directory.
  createEffect(() => {
    const selection = value()

    if (selection === "main" || selection === "create") return
    const project = currentProject()

    if (project) setState("existing", { projectID: project.id, directory: selection })
    void data.location.vcs.sync({ directory: selection }).catch(() => undefined)
  })

  const branch = createMemo(() =>
    resolveNewSessionBranch({
      worktree: value(),
      directory: branchDirectory(),
      createBranch: input.selectedBranch(),
      worktreeBranch: (worktree) => data.location.vcs.info({ directory: worktree })?.branch.current,
    }),
  )

  const remember = (worktree = value()) => {
    const project = currentProject()

    if (!project) return
    tabs.initializeDraftWorktrees(ServerConnection.key(serverSDK.server), sdk().directory, fallback())
    const local = workspaceSelectionDestination(worktree, project.worktree) === "main"
    settings.workspaces.setLastUsed(serverSDK.scope, project.id, local ? "local" : "workspace")
  }

  const select = (worktree: string) => {
    input.setSelectedBranch(undefined)
    input.setSelectedWorktree(worktree)
    remember(worktree)
  }

  // The remembered worktree may have been removed since it was selected. Cycling to a directory the
  // inventory no longer contains would resolve back to the fallback and leave the cycle stuck.
  const existing = () => {
    const project = currentProject()
    const previous = state.existing

    if (!project || previous?.projectID !== project.id) return

    if (!worktreeDirectories().some((item) => sameDirectory(item, previous.directory))) return

    return previous.directory
  }

  return {
    selection: {
      value,
      workspace: createMemo(() => {
        const project = currentProject()
        const current = value()

        if (current === "create") return true

        if (current === "main" || !project) return false

        if (isWorkspaceDirectory(project, current) || !worktreesLoaded()) return true

        return worktreeDirectories().some((item) => sameDirectory(item, current))
      }),
      reset: () => {
        input.setSelectedWorktree(undefined)
        input.setSelectedBranch(undefined)
      },
      remember,
      set: select,
      branch: (branch: string) => input.setSelectedBranch(branch),
      cycle: () => select(cycleNewSessionWorktree({ current: value(), existing: existing() })),
    },
    project: {
      root: projectRoot,
      workspaces: worktreeDirectories,
      managed: managedWorktrees,
      git: visible,
    },
    bar: {
      visible,
      branch,
    },
    branches: {
      items: () => branchResults()?.items ?? [],
      loading: () => branches.loading,
      failed: () => branchResults()?.failed ?? false,
      search: searchBranches,
      open: (open: boolean) => {
        searchBranches.clear()
        setState({ branchesOpen: open, search: "" })
      },
      retry: () => branchActions.refetch(),
    },
  }
}

export type NewSessionWorkspaceController = ReturnType<typeof createNewSessionWorkspaceController>
