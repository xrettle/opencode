import { createSignal, For, Show } from "solid-js"
import { createStore } from "solid-js/store"
import { createResizeObserver } from "@solid-primitives/resize-observer"
import { Menu } from "@opencode/ui/menu"
import { Tooltip } from "@opencode/ui/tooltip"
import { Icon } from "@opencode/ui/icon"
import { useLanguage } from "@/runtime/i18n/language"

/** The base branch for a new worktree. */
export function PromptBranchSelector(props: {
  branch: string
  branches: string[]
  onCreate: (branch: string) => void
  onSearch: (search: string) => void
  onDone?: () => void
}) {
  const language = useLanguage()
  const [search, setSearch] = createStore({ branches: "" })
  const truncation = createTruncatedText()
  let input: HTMLInputElement | undefined
  let pending: string | undefined

  return (
    <Tooltip
      placement="top"
      value={language.t("session.new.workspace.fromBranch", { branch: props.branch })}
      disabled={!truncation.truncated()}
      class="ms-1 min-w-0 max-w-[220px]"
      contentClass="max-w-[calc(100vw-32px)] break-all"
    >
      <Menu
        placement="bottom-start"
        gutter={4}
        onOpenChange={(open) => {
          if (open) {
            setSearch({ branches: "" })
            props.onSearch("")

            return
          }

          const branch = pending
          pending = undefined

          if (branch) props.onCreate(branch)

          props.onDone?.()
        }}
      >
        <Menu.Trigger class="flex h-6 min-w-0 max-w-[220px] items-center gap-1.5 rounded-full bg-v2-background-bg-layer-02 px-2.5 text-[13px] font-[440] leading-5 tracking-[-0.04px] text-v2-text-text-faint transition-colors hover:bg-v2-background-bg-layer-03 hover:text-v2-text-text-muted focus-visible:bg-v2-background-bg-layer-03 focus-visible:text-v2-text-text-muted focus-visible:outline-none data-[expanded]:bg-v2-background-bg-layer-03 data-[expanded]:text-v2-text-text-muted">
          <Icon name="branch-out" size="small" class="shrink-0 text-v2-icon-icon-muted" />
          <span ref={truncation.observe} class="min-w-0 truncate">
            {language.t("session.new.workspace.fromBranch", { branch: props.branch })}
          </span>
          <Icon name="chevron-down" size="small" class="shrink-0 text-v2-icon-icon-muted" />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Content
            class="w-[243px] overflow-hidden rounded-md border-0 bg-v2-background-bg-layer-01 shadow-[var(--v2-elevation-floating)] focus:outline-none"
            onOpenAutoFocus={(event) => {
              event.preventDefault()
              // Kobalte defers its list autofocus until after the focus scope opens.
              setTimeout(() => requestAnimationFrame(() => input?.focus({ preventScroll: true })))
            }}
          >
            <div class="flex h-7 shrink-0 items-center gap-2 rounded-sm pl-3 pr-1 text-v2-icon-icon-muted">
              <Icon name="magnifying-glass" size="small" class="shrink-0" />
              <input
                ref={input}
                value={search.branches}
                placeholder={language.t("session.new.workspace.branch.search.placeholder")}
                aria-label={language.t("session.new.workspace.branch.search.placeholder")}
                class="h-7 min-w-0 flex-1 border-0 bg-transparent text-[13px] font-[440] leading-5 tracking-[-0.04px] text-v2-text-text-base outline-none placeholder:text-v2-text-text-faint"
                onInput={(event) => {
                  setSearch("branches", event.currentTarget.value)
                  props.onSearch(event.currentTarget.value)
                }}
                onKeyDown={(event) => {
                  if (["Escape", "ArrowDown", "ArrowUp", "Enter"].includes(event.key)) return
                  event.stopPropagation()
                }}
              />
              <Show when={search.branches.trim()}>
                <button
                  type="button"
                  class="flex size-5 items-center justify-center rounded-sm bg-transparent text-v2-icon-icon-faint transition-colors hover:text-v2-icon-icon-base focus-visible:text-v2-icon-icon-base active:text-v2-icon-icon-base"
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setSearch("branches", "")
                    props.onSearch("")
                  }}
                  aria-label={language.t("common.clear")}
                >
                  <Icon name="circle-xmark" />
                </button>
              </Show>
            </div>
            <div class="max-h-[224px] overflow-y-auto">
              <Menu.RadioGroup value={props.branch}>
                <For each={props.branches}>
                  {(branch) => (
                    <Menu.RadioItem
                      value={branch}
                      class="h-7 gap-2 rounded-sm px-3 text-[13px] font-[440] leading-5 tracking-[-0.04px] text-v2-text-text-base [font-family:var(--v2-font-family-sans)] data-[highlighted]:!bg-v2-overlay-simple-overlay-hover"
                      closeOnSelect
                      onSelect={() => (pending = branch)}
                    >
                      <span class="min-w-0 truncate leading-5">{branch}</span>
                    </Menu.RadioItem>
                  )}
                </For>
              </Menu.RadioGroup>
            </div>
          </Menu.Content>
        </Menu.Portal>
      </Menu>
    </Tooltip>
  )
}

function createTruncatedText() {
  const [truncated, setTruncated] = createSignal(false)

  return {
    truncated,
    observe: (element: HTMLSpanElement) =>
      createResizeObserver(element, () => setTruncated(element.scrollWidth > element.clientWidth)),
  }
}
