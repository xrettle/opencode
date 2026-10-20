import { expect, test, type Page } from "@playwright/test"
import { expectPath, holdRoute, project, seed, sessionHref } from "../utils/app"
import { fixture, mockStressTimeline } from "../utils/session-fixture"
import { mockWorkspace, newSessionLocation, openSession } from "../utils/workspace"
import { APP_READY_TIMEOUT, expectAppVisible } from "../utils/waits"

const row = (page: Page, title: string) => page.locator('[data-slot="start-row"]').filter({ hasText: title })

test("Home sorts sessions by what they need, approves inline, and a row opens its session", async ({ page }) => {
  const replies: { sessionID: string; permissionID: string; body: unknown }[] = []
  const waiting = { id: "ses_home_waiting", title: "Waiting on approval" }
  const earlier = { id: "ses_home_earlier", title: "Finished earlier" }
  await mockWorkspace(page, {
    name: "Home",
    sessions: [earlier, waiting],
    // Pending requests load for running sessions, so the waiting one runs.
    sessionStatus: { [waiting.id]: { type: "running" } },
    sessionPermissions: {
      [waiting.id]: [
        { id: "per_home", sessionID: waiting.id, action: "shell", resources: ["git status"], metadata: {}, save: [] },
      ],
    },
    onPermissionReply: (reply) => replies.push(reply),
  })
  const location = await holdRoute(page, /\/api\/location(\?|$)/)
  await page.goto("/")

  // Loaded sessions show before the location request resolves.
  await expectAppVisible(row(page, earlier.title))
  location.release()
  await expect(row(page, earlier.title)).toHaveAttribute("data-status", "ready")
  const approval = row(page, waiting.title)
  await expect(approval).toHaveAttribute("data-status", "approval")
  await expect(approval).toContainText("git status")

  await approval.getByRole("button", { name: "Allow", exact: true }).click()
  await expect.poll(() => replies).toEqual([{ sessionID: waiting.id, permissionID: "per_home", body: { decision: "once" } }])
  await expect(approval).toHaveAttribute("data-status", "working")

  await row(page, earlier.title).click()
  await expectPath(page, sessionHref(earlier.id))
  await expect(page.locator('[data-titlebar-tab][data-active="true"]')).toContainText(earlier.title)
})

test("the Home shortcut opens Home and returns to the session", async ({ page }) => {
  const view = await openSession(page, { name: "Shortcut" })
  await view.editor.click()

  await page.keyboard.press("ControlOrMeta+b")
  await expect(page).toHaveURL(new URL("/", page.url()).href)
  await expect(row(page, view.session.title)).toBeVisible()

  await page.keyboard.press("ControlOrMeta+b")
  await expectPath(page, sessionHref(view.session.id))
})

test("the projects rail starts a draft in the chosen project", async ({ page }) => {
  // The rail shows beside the sessions only on wide screens.
  await page.setViewportSize({ width: 1440, height: 900 })
  await mockWorkspace(page, {
    name: "Rail",
    projects: [
      project({ id: "proj_rail", directory: "C:/OpenCode/Rail" }),
      project({ id: "proj_rail_other", directory: "C:/OpenCode/Other" }),
    ],
  })
  await page.goto("/")

  await page.getByRole("button", { name: "New session in Other", exact: true }).click({ timeout: APP_READY_TIMEOUT })
  await expect(page).toHaveURL(/\/new-session\?draftId=/)
  await expect(page.locator('[data-component="new-session"] [data-component="composer-editor"]')).toBeEditable()
  await expect(newSessionLocation(page)).toContainText("Other")
})

test("Home and the directory picker load without newer browser APIs", async ({ page }) => {
  await page.addInitScript(() => {
    // Safari 16.6 has none of these APIs. Remove them before the web entry runs.
    // SAFETY: `Partial` only makes the static method optional so `delete` type-checks; the target is the real global.
    delete (Map as Partial<typeof Map>).groupBy
    // SAFETY: as above, for the real global `Promise`.
    delete (Promise as Partial<typeof Promise>).withResolvers
    // SAFETY: as above, for the real global `Promise`.
    delete (Promise as Partial<typeof Promise>).try
  })
  await mockWorkspace(page, { name: "Safari", fileList: () => [] })
  await page.goto("/")
  await expectAppVisible(row(page, "Safari"))

  await page.locator('[data-slot="home-panel"]').getByRole("button", { name: "New session", exact: true }).click()
  await newSessionLocation(page).click()
  await page.getByRole("dialog").getByRole("option", { name: "Add project" }).click()
  await expect(page.getByRole("button", { name: "Select folder", exact: true })).toBeEnabled()
})

const recovery = "C:/OpenCode/Worktrees/project-menu-recovery"

const worktree =
  "C:/OpenCode/Worktrees/project-42/long-folder-name-for-checking-wrapped-worktree-paths/another-long-folder-name"

for (const state of [
  { name: "local", directory: fixture.directory },
  { name: "worktree", directory: worktree, worktree: "another-long-folder-name" },
  { name: "unopened worktree", directory: recovery, worktree: "project-menu-recovery", recovery: "unopened" },
]) {
  test(`the session location card opens settings and Home for a ${state.name} project`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    const workspace = state.directory !== fixture.directory
    const messages = Promise.withResolvers<void>()
    await mockStressTimeline(page, {
      directory: state.directory,
      // An image icon keeps the avatar initial out of the menu item text.
      project: {
        ...fixture.project,
        sandboxes: workspace ? [state.directory] : [],
        icon: {
          url: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"/>')}`,
        },
      },
      sessions: fixture.sessions.map((item) => ({ ...item, directory: state.directory })),
      beforeMessagesResponse: (input) =>
        state.recovery && input.sessionID === fixture.targetID ? messages.promise : Promise.resolve(),
    })

    // An unopened project has no stored tabs.
    if (state.recovery !== "unopened") await seed(page, { tabs: [fixture.sourceID, fixture.targetID] })
    const name = fixture.project.name
    await page.goto(sessionHref(fixture.targetID))

    const header = page.locator("[data-session-title]")
    const trigger = header.locator('[data-slot="session-location-trigger"]')
    const menu = page.locator('[data-slot="session-location-card"]')
    const projectItem = menu.getByRole("menuitem", { name, exact: true })
    const copyItem = menu.getByRole("menuitem", { name: "Copy path", exact: true })
    const settings = page.getByTestId("settings-screen")
    await expect(header.getByRole("heading")).toHaveText(fixture.expected.targetTitle)

    for (const loaded of state.recovery ? [false, true] : [true]) {
      if (state.recovery && loaded) {
        messages.resolve()
        await expect(header.getByRole("button", { name: "More options", exact: true })).toBeVisible()
      }

      await expect(trigger.locator('[data-slot="session-location-project"]')).toHaveText(name)
      await expect(trigger.locator('[data-slot="session-location-worktree"]')).toHaveText(
        state.worktree ? [state.worktree] : [],
      )
      await trigger.click()
      await expect(menu.getByRole("menuitem")).toHaveText([name, "Copy path", "Edit project"])
      await expect(menu.locator('[data-slot="session-location-path"]')).toHaveText(state.directory)
      await page.keyboard.press("Escape")
      await expect(menu).toBeHidden()
      await expect(trigger).toBeFocused()
      await trigger.press("ArrowDown")
      await expect(projectItem).toBeFocused()
      await page.keyboard.press("ArrowDown")
      await expect(copyItem).toBeFocused()
      await page.keyboard.press("ArrowDown")
      await expect(menu.getByRole("menuitem", { name: "Edit project", exact: true })).toBeFocused()
      await page.keyboard.press("Enter")
      await expect(settings.getByRole("textbox", { name: "Project name", exact: true })).toHaveValue(name)
      await settings.getByRole("button", { name: "Back to projects", exact: true }).click()
      await settings.getByRole("button", { name: "Back to app", exact: true }).click()
      await expect(settings).toBeHidden()
    }

    await trigger.click()
    await projectItem.click()
    await expect(page).toHaveURL(new URL("/", page.url()).href)
    await expect(row(page, fixture.expected.targetTitle)).toBeVisible()
  })
}
