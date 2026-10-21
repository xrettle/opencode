import { Loader } from "./loader"

const docs = `### Overview
Pixel-grid loader for compact loading states.

### API
- Accepts standard SVG props.

### Behavior
- Grid pixels pulse in opacity using the shared spinner animation.

### Accessibility
- Sets \`aria-hidden="true"\` by default.
`

export default {
  title: "UI/Loader",
  id: "ui-loader",
  component: Loader,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: docs,
      },
    },
  },
}

export const Basic = {
  render: () => <Loader />,
}

export const Sizes = {
  render: () => (
    <div style={{ display: "flex", gap: "16px", "align-items": "center" }}>
      <Loader width={12} height={12} />
      <Loader />
      <Loader width={24} height={24} />
    </div>
  ),
}
