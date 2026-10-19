import { Component, createEffect, createMemo, For, on, Show } from "solid-js"
import { createStore } from "solid-js/store"
import { useData } from "@/runtime/server/current"
import { useWorkspaceLocation } from "@/workspaces/location"
import { Button } from "@opencode/ui/button"
import { Dialog, DialogBody, DialogHeader, DialogTitleGroup } from "@opencode/ui/dialog"
import { useFilteredList } from "@opencode/ui/hooks"
import { Icon } from "@opencode/ui/icon"
import { ScrollView } from "@opencode/ui/scroll-view"
import { Switch } from "@opencode/ui/switch"
import { TextInput } from "@opencode/ui/text-input"
import { useLanguage } from "@/runtime/i18n/language"
import { useMcpToggle } from "@/providers/connect/mcp"
import { usePlatform } from "@/runtime/platform/platform"
import { showToast } from "@/shell/notifications/toast"
import "@/shell/search-list.css"

const statusLabels = {
  connected: "mcp.status.connected",
  failed: "mcp.status.failed",
  needs_auth: "mcp.status.needs_auth",
  disabled: "mcp.status.disabled",
} as const

export const DialogSelectMcp: Component = () => {
  const data = useData()
  const sdk = useWorkspaceLocation()
  const language = useLanguage()
  const platform = usePlatform()
  const toggle = useMcpToggle(() => sdk().directory)
  const [store, setStore] = createStore<{ detail?: string; copied: boolean }>({ copied: false })

  const servers = createMemo(() => data.location.mcp.server.list({ directory: sdk().directory }) ?? [])

  const items = createMemo(() =>
    servers()
      .map((server) => ({ name: server.name, status: server.status.status }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  )

  const enabledCount = createMemo(() => items().filter((i) => i.status === "connected").length)

  // Like the TUI, a failed server's row opens its error; retrying and disabling happen there.
  const failure = createMemo(() => {
    const server = servers().find((item) => item.name === store.detail)

    return server?.status.status === "failed" ? { name: server.name, error: server.status.error } : undefined
  })

  const toggleServer = (name: string) => {
    const status = servers().find((server) => server.name === name)?.status.status

    if (!status || status === "pending" || toggle.isPending) return
    toggle.mutate(name)
  }

  const select = (name: string) => {
    if (servers().find((server) => server.name === name)?.status.status !== "failed") return toggleServer(name)
    setStore({ detail: name, copied: false })
    requestAnimationFrame(() => backRef?.focus())
  }

  const back = () => {
    setStore("detail", undefined)
    requestAnimationFrame(() => {
      searchRef?.focus()
      const active = list.active()

      if (active)
        resultsRef?.querySelector(`[data-option-key="${CSS.escape(active)}"]`)?.scrollIntoView({ block: "nearest" })
    })
  }

  const onDetailKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return
    event.preventDefault()
    event.stopPropagation()
    back()
  }

  // A successful retry or a removed server leaves nothing to show, so return to the list.
  createEffect(
    on(failure, (current) => {
      if (store.detail && !current) back()
    }),
  )

  const copy = (current: { name: string; error: string }) => {
    const details = language.t("dialog.mcp.error.details", { name: current.name, error: current.error })

    return (platform.writeClipboardText?.(details) ?? navigator.clipboard.writeText(details))
      .then(() => setStore("copied", true))
      .catch((error: unknown) =>
        showToast({
          variant: "error",
          title: language.t("dialog.mcp.error.copyFailed"),
          description: error instanceof Error ? error.message : String(error),
        }),
      )
  }

  // A toggle changes the server's status, which makes the list reset its highlight to the first row; keep the user's place.
  let kept = ""

  const list = useFilteredList({
    items,
    key: (x) => x.name,
    filterKeys: ["name", "status"],
    sortBy: (a, b) => a.name.localeCompare(b.name),
    onSelect: (x) => {
      if (!x) return
      kept = x.name
      select(x.name)
    },
  })

  createEffect(
    on(
      list.flat,
      (items) => {
        if (kept && items.some((item) => item.name === kept)) list.setActive(kept)
      },
      { defer: true },
    ),
  )

  let resultsRef: HTMLDivElement | undefined
  let searchRef: HTMLInputElement | undefined
  let backRef: HTMLButtonElement | undefined

  const onKeyDown = (event: KeyboardEvent) => {
    list.onKeyDown(event)
    const active = list.active()

    if (!active) return

    if (kept) kept = active
    resultsRef?.querySelector(`[data-option-key="${CSS.escape(active)}"]`)?.scrollIntoView({ block: "nearest" })
  }

  return (
    <Dialog class="search-list-dialog">
      <Show
        when={failure()}
        fallback={
          <>
            <DialogHeader>
              <DialogTitleGroup
                title={language.t("dialog.mcp.title")}
                description={language.t("dialog.mcp.description", { enabled: enabledCount(), total: items().length })}
              />
            </DialogHeader>
            <DialogBody class="search-list-body">
              <div class="search-list-search">
                <TextInput
                  type="search"
                  appearance="base"
                  class="!w-full"
                  leadingIcon={<Icon name="magnifying-glass" size="small" />}
                  value={list.filter()}
                  onInput={(event) => {
                    kept = ""
                    list.onInput(event.currentTarget.value)
                  }}
                  ref={searchRef}
                  onKeyDown={onKeyDown}
                  placeholder={language.t("common.search.placeholder")}
                  spellcheck={false}
                  autocorrect="off"
                  autocomplete="off"
                  autocapitalize="off"
                  autofocus
                  aria-label={language.t("common.search.placeholder")}
                  showClearButton={!!list.filter()}
                  clearIcon="circle-xmark"
                  clearLabel={language.t("common.clear")}
                  onClearClick={() => list.clear()}
                />
              </div>
              <ScrollView class="search-list-scroll" viewportRef={(el) => (resultsRef = el)}>
                <Show
                  when={list.flat().length > 0}
                  fallback={
                    <div class="search-list-empty">
                      {language.t(items().length > 0 ? "dialog.mcp.search.empty" : "dialog.mcp.empty")}
                    </div>
                  }
                >
                  <div role="listbox" class="search-list-results">
                    <For each={list.flat()}>
                      {(item) => {
                        const status = () => servers().find((server) => server.name === item.name)?.status

                        const detail = () => {
                          const current = status()

                          if (!current || current.status === "pending" || current.status === "failed") return

                          return language.t(statusLabels[current.status])
                        }

                        return (
                          <div
                            role="option"
                            aria-selected={list.active() === item.name}
                            data-option-key={item.name}
                            data-active={list.active() === item.name ? "" : undefined}
                            class="search-list-row"
                            onMouseMove={() => {
                              kept = item.name
                              list.setActive(item.name)
                            }}
                            onMouseLeave={() => {
                              kept = ""
                              list.setActive("")
                            }}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => select(item.name)}
                          >
                            <div class="search-list-row-text">
                              <span class="search-list-title">{item.name}</span>
                              <Show when={detail()}>
                                <span class="search-list-detail">{detail()}</span>
                              </Show>
                            </div>
                            {/* Sized for the failed link so every row's text truncates at the same edge. */}
                            <div
                              class="search-list-trailing min-w-14 justify-end"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <Show
                                when={status()?.status === "failed"}
                                fallback={
                                  <Switch
                                    checked={status()?.status === "connected"}
                                    disabled={
                                      status()?.status === "pending" ||
                                      (toggle.isPending && toggle.variables === item.name)
                                    }
                                    onChange={() => toggleServer(item.name)}
                                  />
                                }
                              >
                                <button
                                  type="button"
                                  class="inline-flex cursor-pointer items-center gap-0.5 rounded-sm text-v2-state-fg-danger underline-offset-3 hover:underline focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-v2-border-border-focus"
                                  aria-label={language.t("dialog.mcp.error.open", { name: item.name })}
                                  onClick={() => select(item.name)}
                                >
                                  {language.t("mcp.status.failed")}
                                  <Icon name="chevron-right" size="small" />
                                </button>
                              </Show>
                            </div>
                          </div>
                        )
                      }}
                    </For>
                  </div>
                </Show>
              </ScrollView>
            </DialogBody>
          </>
        }
      >
        {(current) => (
          // Escape steps back to the list, like the TUI, instead of closing the dialog.
          <div class="contents" data-owns-escape onKeyDown={onDetailKeyDown}>
            <DialogHeader>
              <div class="flex min-w-0 flex-1 items-start gap-2">
                <button
                  ref={backRef}
                  type="button"
                  class="flex size-5 shrink-0 items-center justify-center rounded-sm text-v2-icon-icon-muted hover:bg-v2-overlay-simple-overlay-hover focus-visible:bg-v2-overlay-simple-overlay-hover focus-visible:outline-none"
                  onClick={back}
                  aria-label={language.t("common.goBack")}
                >
                  <Icon name="arrow-left" size="small" />
                </button>
                <DialogTitleGroup title={language.t("dialog.mcp.error.title", { name: current().name })} />
              </div>
            </DialogHeader>
            <DialogBody class="search-list-body">
              <div class="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-4">
                <pre
                  tabIndex={0}
                  class="min-h-0 flex-1 select-text overflow-auto whitespace-pre-wrap break-words rounded-md bg-v2-background-bg-layer-03 px-3 py-2 font-mono text-[12px] leading-[18px] text-v2-text-text-base focus-visible:outline focus-visible:outline-1 focus-visible:outline-v2-border-border-focus"
                >
                  {current().error}
                </pre>
                <div class="flex shrink-0 justify-end gap-2">
                  <Button variant="ghost" icon={store.copied ? "check" : "copy"} onClick={() => void copy(current())}>
                    {language.t(store.copied ? "common.copied" : "dialog.mcp.error.copy")}
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={toggle.isPending}
                    onClick={() => toggle.mutate({ name: current().name, enabled: false })}
                  >
                    {language.t("dialog.mcp.error.disable")}
                  </Button>
                  <Button variant="neutral" disabled={toggle.isPending} onClick={() => toggleServer(current().name)}>
                    {language.t("common.retry")}
                  </Button>
                </div>
              </div>
            </DialogBody>
          </div>
        )}
      </Show>
    </Dialog>
  )
}
