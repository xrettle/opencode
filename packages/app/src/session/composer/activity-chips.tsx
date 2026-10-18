import { Icon } from "@opencode/ui/icon"
import { Menu } from "@opencode/ui/menu"
import { For, Index, Show } from "solid-js"
import { useLanguage } from "@/runtime/i18n/language"
import "./activity-chips.css"

export type SessionActivityItem = {
  key: string
  type: "subagent" | "shell"
  label?: string
  agent?: string
  sessionID?: string
  target: string
}

// Live work above the composer, one capsule like the iOS app's background-work summary.
export function SessionActivityChips(props: {
  subagents: readonly SessionActivityItem[]
  shells: readonly SessionActivityItem[]
  onOpen: (item: SessionActivityItem) => void
}) {
  const language = useLanguage()

  const label = () => language.activitySummary({ subagents: props.subagents.length, shells: props.shells.length })

  return (
    <Show when={props.subagents.length > 0 || props.shells.length > 0}>
      <div data-component="session-activity-chips" class="flex items-center pb-2">
        <Menu gutter={6} placement="top-start">
          <Menu.Trigger
            as="button"
            type="button"
            data-slot="session-activity-chip"
            class="flex h-7 min-w-0 max-w-full items-center gap-1.5 rounded-full border border-v2-border-border-base bg-v2-background-bg-base ps-2 pe-2.5 text-[13px] font-[530] leading-text-compact tracking-[-0.04px] whitespace-nowrap tabular-nums text-v2-text-text-base shadow-[var(--v2-elevation-raised)] outline-none duration-150 ease-out animate-in fade-in motion-reduce:animate-none hover:bg-v2-background-bg-layer-01 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v2-border-border-focus data-[expanded]:bg-v2-background-bg-layer-01"
          >
            <SessionActivityGlyph />
            <span class="truncate">{label()}</span>
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Content class="w-72 max-w-[calc(100vw-24px)]" aria-label={label()}>
              <Show when={props.subagents.length > 0}>
                <Menu.Group>
                  <Menu.GroupLabel>{language.t("session.activity.section.subagents")}</Menu.GroupLabel>
                  <For each={props.subagents}>
                    {(item) => (
                      <Menu.Item onSelect={() => props.onOpen(item)}>
                        <SessionActivityGlyph class="text-v2-icon-icon-muted" />
                        <span class="shrink-0 font-[530]">
                          {item.agent
                            ? `${item.agent[0].toUpperCase()}${item.agent.slice(1)}`
                            : language.t("ui.tool.agent.default")}
                        </span>
                        <span dir="auto" class="me-1.5 min-w-0 flex-1 truncate text-v2-text-text-muted">
                          {item.label}
                        </span>
                      </Menu.Item>
                    )}
                  </For>
                </Menu.Group>
              </Show>
              <Show when={props.subagents.length > 0 && props.shells.length > 0}>
                <Menu.Separator />
              </Show>
              <Show when={props.shells.length > 0}>
                <Menu.Group>
                  <Menu.GroupLabel>{language.t("session.activity.section.shells")}</Menu.GroupLabel>
                  <For each={props.shells}>
                    {(item) => (
                      <Menu.Item onSelect={() => props.onOpen(item)}>
                        <Icon name="console" class="shrink-0 text-v2-icon-icon-muted" />
                        <span dir="ltr" class="me-1.5 min-w-0 flex-1 truncate font-mono text-v2-text-text-base">
                          {item.label}
                        </span>
                      </Menu.Item>
                    )}
                  </For>
                </Menu.Group>
              </Show>
            </Menu.Content>
          </Menu.Portal>
        </Menu>
      </div>
    </Show>
  )
}

// A 5×5 dot matrix with a diagonal wave, ported from the iOS app's AgentActivityGlyph.
function SessionActivityGlyph(props: { class?: string }) {
  // Glyphs mounted at different times share one phase, like the iOS glyph's clock-driven wave.
  const phase = `${-(performance.now() % 1100)}ms`

  return (
    <svg
      data-component="session-activity-glyph"
      class={props.class}
      width={15}
      height={15}
      viewBox="0 0 5 5"
      aria-hidden="true"
      style={{ "--session-activity-glyph-phase": phase }}
    >
      <Index each={Array.from({ length: 25 })}>
        {(_, index) => (
          <circle
            data-dot
            cx={(index % 5) + 0.5}
            cy={Math.floor(index / 5) + 0.5}
            r={0.31}
            style={{ "--diagonal": (index % 5) + Math.floor(index / 5) }}
          />
        )}
      </Index>
      <circle data-reduced-motion cx={2.5} cy={2.5} r={0.75} />
    </svg>
  )
}
