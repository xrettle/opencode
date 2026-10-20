import { describe, expect, test } from "bun:test"
import { Predicate } from "effect"
import { decide, probeResult, type LocalService } from "../../../../client/src/service-probe"
import { initializationData } from "../../renderer/startup/initialization"
import { parseCliVersion, serviceVersion, shouldCleanStages } from "./cli-version"

const protocolMessage =
  "Background service uses an incompatible health protocol. Update this client or explicitly restart the service."

function registered(input: Pick<LocalService, "state" | "compatible" | "version">): LocalService {
  return {
    info: { url: "http://127.0.0.1:4096", pid: 4242, version: input.version },
    endpoint: { url: "http://127.0.0.1:4096" },
    ...input,
  }
}

describe("cli-version", () => {
  test.each([
    { output: "opencode v2.0.32", expected: "2.0.32" },
    { output: "opencode-cli v0.0.0-beta-21153", expected: "0.0.0-beta-21153" },
    { output: "2.0.32", expected: "2.0.32" },
  ])("parses CLI version output ($output)", (input) => {
    expect(parseCliVersion(input.output)).toBe(input.expected)
  })

  test("rejects empty CLI version output", () => {
    expect(() => parseCliVersion("")).toThrow("V2 CLI did not provide a version")
  })

  test.each([
    {
      name: "beta initial adopts any compatible version",
      channel: "beta" as const,
      isolated: false,
      mode: "initial" as const,
      version: "0.0.0-beta-21154",
      expected: undefined,
    },
    {
      name: "beta isolated dev server enforces the worktree version",
      channel: "beta" as const,
      isolated: true,
      mode: "initial" as const,
      version: "0.0.0-beta-21154",
      expected: "0.0.0-beta-21154",
    },
    {
      name: "prod initial enforces the bundled version",
      channel: "prod" as const,
      isolated: false,
      mode: "initial" as const,
      version: "2.0.32",
      expected: "2.0.32",
    },
    {
      name: "dev initial enforces the bundled version",
      channel: "dev" as const,
      isolated: false,
      mode: "initial" as const,
      version: "2.0.32-dev",
      expected: "2.0.32-dev",
    },
    {
      name: "local initial enforces the bundled version",
      channel: "local" as const,
      isolated: false,
      mode: "initial" as const,
      version: "2.0.0-local",
      expected: "2.0.0-local",
    },
    {
      name: "prod reconnect adopts any compatible version",
      channel: "prod" as const,
      isolated: false,
      mode: "reconnect" as const,
      version: "2.0.32",
      expected: undefined,
    },
    {
      name: "beta reconnect adopts any compatible version",
      channel: "beta" as const,
      isolated: false,
      mode: "reconnect" as const,
      version: "0.0.0-beta-21154",
      expected: undefined,
    },
  ])("$name", (input) => {
    expect(serviceVersion(input)).toBe(input.expected)
  })

  test.each([
    {
      name: "beta adopts a healthy registered service running an older version",
      channel: "beta" as const,
      bundled: "0.0.0-beta-21154",
      service: registered({ version: "0.0.0-beta-21150", state: "ready", compatible: true }),
      expected: { _tag: "reuse" as const },
    },
    {
      name: "beta adopts a healthy registered service running the same version",
      channel: "beta" as const,
      bundled: "0.0.0-beta-21154",
      service: registered({ version: "0.0.0-beta-21154", state: "ready", compatible: true }),
      expected: { _tag: "reuse" as const },
    },
    {
      name: "beta adopts a healthy registered service running a newer version",
      channel: "beta" as const,
      bundled: "0.0.0-beta-21154",
      service: registered({ version: "0.0.0-beta-21160", state: "ready", compatible: true }),
      expected: { _tag: "reuse" as const },
    },
    {
      name: "beta waits for a starting registered service regardless of version",
      channel: "beta" as const,
      bundled: "0.0.0-beta-21154",
      service: registered({ version: "0.0.0-beta-21150", state: "waiting", compatible: true }),
      expected: { _tag: "wait" as const },
    },
    {
      name: "beta surfaces an in-app message instead of killing a protocol-incompatible service",
      channel: "beta" as const,
      bundled: "0.0.0-beta-21154",
      service: registered({ version: "0.0.0-beta-21150", state: "ready", compatible: false }),
      expected: { _tag: "fail" as const, error: new Error(protocolMessage) },
    },
    {
      name: "prod adopts a healthy registered service with the matching version",
      channel: "prod" as const,
      bundled: "2.0.32",
      service: registered({ version: "2.0.32", state: "ready", compatible: true }),
      expected: { _tag: "reuse" as const },
    },
    {
      name: "prod replaces a healthy registered service with an older version",
      channel: "prod" as const,
      bundled: "2.0.32",
      service: registered({ version: "2.0.31", state: "ready", compatible: true }),
      expected: { _tag: "replace" as const, pty: "handoff" as const },
    },
    {
      name: "prod replaces a healthy registered service with a newer version",
      channel: "prod" as const,
      bundled: "2.0.32",
      service: registered({ version: "2.0.33", state: "ready", compatible: true }),
      expected: { _tag: "replace" as const, pty: "handoff" as const },
    },
    {
      name: "prod replaces an unhealthy failed service from another version",
      channel: "prod" as const,
      bundled: "2.0.32",
      service: registered({ version: "2.0.31", state: "failed", compatible: true }),
      expected: { _tag: "replace" as const, pty: "clear" as const },
    },
    {
      name: "prod replaces a protocol-incompatible service when its version differs",
      channel: "prod" as const,
      bundled: "2.0.32",
      service: registered({ version: "2.0.31", state: "ready", compatible: false }),
      expected: { _tag: "replace" as const, pty: "handoff" as const },
    },
    {
      name: "prod surfaces an in-app message when a matching-version service is protocol-incompatible",
      channel: "prod" as const,
      bundled: "2.0.32",
      service: registered({ version: "2.0.32", state: "ready", compatible: false }),
      expected: { _tag: "fail" as const, error: new Error(protocolMessage) },
    },
  ])("$name", (input) => {
    const version = serviceVersion({ channel: input.channel, mode: "initial", version: input.bundled })
    const outcome = decide(input.service, { version })
    expect(outcome).toEqual(input.expected)

    if (Predicate.isTagged(outcome, "fail")) {
      expect(() => initializationData(Object.assign(() => undefined, { error: outcome.error }))).toThrow(
        protocolMessage,
      )
    }
  })

  test("an unreachable registered service probes as missing so ensure replaces it", async () => {
    const probed = await probeResult({ url: "http://127.0.0.1:1", pid: 4242, version: "0.0.0-beta-21150" }, 200)
    expect(probed.service).toBeUndefined()
  })

  test.each([
    {
      name: "beta keeps staged CLIs when adopting an existing server",
      isolated: false,
      mode: "initial" as const,
      packaged: true,
      started: false,
      version: undefined,
      expected: false,
    },
    {
      name: "beta cleans staged CLIs when it starts a new server",
      isolated: false,
      mode: "initial" as const,
      packaged: true,
      started: true,
      version: undefined,
      expected: true,
    },
    {
      name: "prod cleans staged CLIs on initial launch",
      isolated: false,
      mode: "initial" as const,
      packaged: true,
      started: false,
      version: "2.0.32",
      expected: true,
    },
    {
      name: "unpackaged non-isolated builds never clean stages",
      isolated: false,
      mode: "initial" as const,
      packaged: false,
      started: true,
      version: "2.0.32",
      expected: false,
    },
  ])("$name", (input) => {
    expect(shouldCleanStages(input)).toBe(input.expected)
  })
})
