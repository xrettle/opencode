import { expect, test, type Page } from "@playwright/test"
import { NO_PROVIDER, sessionHref } from "../utils/app"
import type { MockServerConfig } from "../utils/mock-server"
import { mockWorkspace } from "../utils/workspace"
import { expectSessionTitle } from "../utils/waits"

const directory = "C:\\OpenCode\\main"

const workspace = "C:\\OpenCode\\worktree"

const sessionID = "ses_mcp_workspace"

const title = "Workspace MCP routing"

type Surface = "popover" | "dialog"

// A session in a worktree of the project. The harness answers the MCP list for each location directory and stores
// connect/disconnect results per directory; `requests` records every MCP request and the directory it targeted.
// The popover belongs to the summary extension; the dialog (Ctrl+;) is the app's own MCP toggle.
async function open(
  page: Page,
  input: { surface: Surface } & Pick<MockServerConfig, "mcp" | "onMcpAction" | "integrations" | "onIntegrationOAuth">,
) {
  const requests: { path: string; directory: string }[] = []
  page.on("request", (request) => {
    const url = new URL(request.url())

    if (request.method() === "OPTIONS" || !/^\/api\/(?:experimental\/)?mcp(?:\/|$)/.test(url.pathname)) return
    requests.push({ path: url.pathname, directory: url.searchParams.get("location[directory]") || directory })
  })

  const mock = await mockWorkspace(page, {
    name: "mcp-workspace",
    directory,
    project: { sandboxes: [workspace] },
    provider: NO_PROVIDER,
    sessions: [{ id: sessionID, title, directory: workspace }],
    seed: { settings: { keybinds: { "mcp.toggle": "ctrl+;" } } },
    mcp: input.mcp,
    onMcpAction: input.onMcpAction,
    integrations: input.integrations,
    onIntegrationOAuth: input.onIntegrationOAuth,
  })
  await page.goto(sessionHref(sessionID))
  await expectSessionTitle(page, title)
  await expect(page.getByRole("textbox", { name: "Prompt", exact: true })).toBeEditable()
  const panel = page.getByRole("dialog", { name: input.surface === "popover" ? "MCP" : "MCPs", exact: true })

  const show = async () => {
    if (input.surface === "dialog") return page.keyboard.press("Control+;")
    await page.getByRole("button", { name: "Session details", exact: true }).click()
    await page.getByRole("button", { name: "MCP", exact: true }).click()
  }

  await show()
  await expect(panel.getByText("figma-desktop", { exact: true })).toBeVisible()

  return { requests, panel, show, push: mock.push, toggle: panel.getByRole("switch") }
}

for (const shared of [true, false]) {
  test(`toggles the workspace MCP when the default location ${shared ? "has" : "does not have"} the server`, async ({
    page,
  }) => {
    const actions: Parameters<NonNullable<MockServerConfig["onMcpAction"]>>[0][] = []

    const view = await open(page, {
      surface: "popover",
      mcp: (target) =>
        !shared && target !== workspace ? [] : [{ name: "figma-desktop", status: { status: "disabled" } }],
      onMcpAction: (action) => void actions.push(action),
    })

    await expect(view.toggle).not.toBeChecked()
    await expect(view.toggle).toBeEnabled()
    view.requests.length = 0

    await view.panel.locator('[data-slot="switch-control"]').click()
    await expect(view.toggle).toBeChecked()
    await expect(view.toggle).toBeEnabled()
    expect(actions).toEqual([{ server: "figma-desktop", action: "connect", directory: workspace }])
    expect(view.requests).toContainEqual({ path: "/api/experimental/mcp/figma-desktop/connect", directory: workspace })
    expect(view.requests).toContainEqual({ path: "/api/mcp/resource", directory: workspace })
    expect(view.requests.every((request) => request.directory === workspace)).toBe(true)

    view.requests.length = 0
    await view.panel.getByText("figma-desktop", { exact: true }).click()
    await expect(view.toggle).not.toBeChecked()
    await expect(view.toggle).toBeEnabled()
    expect(actions).toEqual([
      { server: "figma-desktop", action: "connect", directory: workspace },
      { server: "figma-desktop", action: "disconnect", directory: workspace },
    ])
    expect(view.requests).toContainEqual({
      path: "/api/experimental/mcp/figma-desktop/disconnect",
      directory: workspace,
    })
    expect(view.requests.every((request) => request.directory === workspace)).toBe(true)
  })
}

for (const surface of ["popover", "dialog"] as const) {
  test(`shows connection failures from the MCP ${surface} and allows reconnecting`, async ({ page }) => {
    const error = "Streamable HTTP error: Error POSTing to endpoint: 404 Not Found"
    const state = { fail: true }

    const view = await open(page, {
      surface,
      mcp: (target) => [
        {
          name: "figma-desktop",
          status: { status: target !== workspace ? "connected" : surface === "popover" ? "failed" : "disabled", error },
        },
      ],
      // Connection failures are reported by the refreshed status, not the HTTP response.
      onMcpAction: (input) => (input.action === "connect" && state.fail ? { status: "failed", error } : undefined),
    })

    // A failed server shows as enabled in the popover; switch it off first.
    const reset = async () => {
      if (surface !== "popover") return
      await expect(view.toggle).toBeChecked()
      await view.panel.getByText("figma-desktop", { exact: true }).click()
    }

    // The dialog opens with its search focused and the first server highlighted.
    if (surface === "dialog") {
      await expect(view.panel.getByRole("searchbox", { name: "Search", exact: true })).toBeFocused()
      await expect(view.panel.getByRole("option")).toHaveAttribute("aria-selected", "true")
    }

    await reset()
    await expect(view.toggle).not.toBeChecked()
    await expect(view.toggle).toBeEnabled()
    view.requests.length = 0

    await view.panel.locator('[data-slot="switch-control"]').click()

    const toast = page
      .getByRole("listitem", { includeHidden: true })
      .filter({ has: page.getByText("Request failed", { exact: true }) })

    await expect(toast.getByText(`figma-desktop: ${error}`, { exact: true })).toBeVisible()
    // The dialog replaces a failed server's switch with a button that opens its error.
    const failed = view.panel.getByRole("button", { name: "figma-desktop failed, view error", exact: true })
    const details = page.getByRole("dialog", { name: "MCP server: figma-desktop", exact: true })

    if (surface === "popover") {
      await expect(view.toggle).toBeChecked()
      await expect(view.toggle).toBeEnabled()
    }

    if (surface === "dialog") await expect(view.toggle).toHaveCount(0)
    expect(view.requests.filter((request) => request.path.endsWith("/connect"))).toEqual([
      { path: "/api/experimental/mcp/figma-desktop/connect", directory: workspace },
    ])
    expect(view.requests.every((request) => request.directory === workspace)).toBe(true)

    if (surface === "dialog") {
      await failed.click()
      await expect(details.getByText(error, { exact: true })).toBeVisible()
      await details.getByRole("button", { name: "Navigate back", exact: true }).click()
      await expect(failed).toBeVisible()
    }

    if (surface === "popover") await page.keyboard.press("Escape")

    if (surface === "dialog") await view.panel.getByRole("button", { name: "Close", exact: true }).click()
    await expect(view.panel).toBeHidden()
    await toast.getByRole("button", { name: "Dismiss", exact: true }).click()
    await expect(toast).toBeHidden()
    state.fail = false
    await expect(page.getByRole("dialog", { name: "Session details", exact: true })).toBeHidden()
    await view.show()
    await reset()

    if (surface === "dialog") {
      await failed.click()
      await details.getByRole("button", { name: "Try again", exact: true }).click()
    }

    if (surface === "popover") {
      await expect(view.toggle).not.toBeChecked()
      await expect(view.toggle).toBeEnabled()
      await view.panel.locator('[data-slot="switch-control"]').click()
    }
    await expect(view.toggle).toBeChecked()
    await expect(view.toggle).toBeEnabled()
    await expect(toast).toBeHidden()
  })
}

test("signs in to an auth-gated MCP from the dialog", async ({ page, context }) => {
  const state = { signedIn: false }
  const attempts: string[] = []
  await context.route("https://auth.example.test/**", (route) => route.fulfill({ body: "Sign in" }))

  const view = await open(page, {
    surface: "dialog",
    mcp: () => [
      {
        name: "figma-desktop",
        integrationID: "figma-oauth",
        status: state.signedIn ? { status: "connected" } : { status: "needs_auth", error: "Sign in required" },
      },
    ],
    integrations: [{ id: "figma-oauth", name: "Figma", methods: [{ id: "oauth", type: "oauth" }], connections: [] }],
    onIntegrationOAuth: (input) => {
      attempts.push(input.directory)

      return { url: "https://auth.example.test/authorize" }
    },
  })

  // The switch would only start sign-in, so the dialog offers that action in its place.
  await expect(view.toggle).toHaveCount(0)
  const popup = page.waitForEvent("popup")
  await view.panel.getByRole("button", { name: "Sign in to figma-desktop", exact: true }).click()
  await expect(await popup).toHaveURL("https://auth.example.test/authorize")
  expect(attempts).toEqual([workspace])

  // Completing sign-in reconnects the server, which reports the change.
  state.signedIn = true
  await view.push([
    {
      id: "evt_mcp_signed_in",
      created: 1,
      type: "mcp.status.changed",
      location: { directory: workspace },
      data: { server: "figma-desktop" },
    },
  ])
  await expect(view.toggle).toBeChecked()
  await expect(view.panel.getByRole("button", { name: "Sign in to figma-desktop", exact: true })).toHaveCount(0)
})
