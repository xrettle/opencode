export function parseCliVersion(output: string) {
  const marker = output.lastIndexOf(" v")
  const version = marker === -1 ? output : output.slice(marker + 2)

  if (!version) throw new Error("V2 CLI did not provide a version")

  return version
}

export function serviceVersion(input: {
  readonly channel: "local" | "dev" | "beta" | "prod"
  readonly isolated?: boolean
  readonly mode: "initial" | "reconnect"
  readonly version: string
}) {
  if (input.mode === "reconnect") return undefined

  if (input.channel === "beta" && !input.isolated) return undefined

  return input.version
}

export function shouldCleanStages(input: {
  readonly isolated?: boolean
  readonly mode: "initial" | "reconnect"
  readonly packaged: boolean
  readonly started: boolean
  readonly version: string | undefined
}) {
  if (!input.packaged && !input.isolated) return false

  return input.started || (input.mode === "initial" && input.version !== undefined)
}
