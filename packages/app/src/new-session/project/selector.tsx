import { type Accessor } from "solid-js"
import { Icon } from "@opencode/ui/icon"
import { useLanguage } from "@/runtime/i18n/language"
import { pathKey } from "@/workspaces/path-key"

export type PromptProject = {
  name?: string
  id?: string
  worktree: string
  vcs?: string
  sandboxes?: string[]
  worktrees?: { directory: string; strategy?: string }[]
  icon?: { color?: string; url?: string; override?: string }
  server?: { key: string; name: string }
}

export type PromptProjectControls = {
  available: PromptProject[]
  directory: string
  projectID?: string
  server?: string
  /** Moves the draft to a project; `workspace` is "main", "create", or a worktree directory. */
  select: (directory: string, server?: string, workspace?: string) => void
  add: (title: string, server?: string) => void
}

export function createPromptProjectController(input: { controls: Accessor<PromptProjectControls> }) {
  const language = useLanguage()

  const current = () => {
    const controls = input.controls()
    const key = pathKey(controls.directory)
    const projects = controls.available.filter((project) => !project.server || project.server.key === controls.server)

    return (
      projects.find(
        (project) =>
          pathKey(project.worktree) === key || project.sandboxes?.some((sandbox) => pathKey(sandbox) === key),
      ) ?? projects.find((project) => controls.projectID && project.id === controls.projectID)
    )
  }

  const selected = () => current() ?? input.controls().available[0]

  const matches = (project: PromptProject, other?: PromptProject) =>
    !!other && pathKey(other.worktree) === pathKey(project.worktree) && other.server?.key === project.server?.key

  return {
    selected,
    isSelected: (project: PromptProject) => matches(project, selected()),
    empty: () => input.controls().available.length === 0,
    projects: () => input.controls().available,
    servers: () =>
      input
        .controls()
        .available.map((project) => project.server)
        .filter(
          (server, index, all): server is NonNullable<typeof server> =>
            !!server && all.findIndex((item) => item?.key === server.key) === index,
        ),
    labels: {
      add: () => language.t("session.new.project.add"),
      new: () => language.t("session.new.project.new"),
    },
    add(server?: string) {
      input.controls().add(language.t("command.project.open"), server)
    },
    select(project: PromptProject, workspace?: string) {
      if (matches(project, current())) return
      input.controls().select(project.worktree, project.server?.key, workspace)
    },
  }
}

export type PromptProjectController = ReturnType<typeof createPromptProjectController>

export function PromptProjectAddButton(props: { controller: PromptProjectController }) {
  return (
    <button
      data-action="prompt-project"
      type="button"
      class="flex h-7 min-w-0 max-w-[160px] items-center gap-1.5 rounded-sm px-2 text-[13px] font-[440] leading-5 tracking-[-0.04px] text-v2-text-text-faint transition-colors hover:bg-v2-overlay-simple-overlay-hover focus-visible:bg-v2-overlay-simple-overlay-hover focus-visible:outline-none"
      onClick={() => props.controller.add()}
    >
      <Icon name="folder-add-left" size="small" class="shrink-0 text-v2-icon-icon-muted" />
      <span class="min-w-0 truncate leading-5">{props.controller.labels.new()}</span>
      <Icon name="chevron-down" size="small" class="shrink-0 text-v2-icon-icon-muted" />
    </button>
  )
}
