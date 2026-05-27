# Themeable-literal inventory (task 1.2)

Grep across `src/components/*.svelte` and `src/global.css` matching hex, `rgba(`,
`hsl(`, and `font-family`. This is the checklist the tokenization (3.1/4.1) and
the re-grep gate (5.1) follow.

## Palette set (confirmed)

| Literal     | Palette token       | Role                                              |
| ----------- | ------------------- | ------------------------------------------------- |
| `#c87941`   | `--accent-warm`     | orange accent (arc, active text/border, key)      |
| `#e8dcc8`   | `--text-primary`    | cream text (panel labels, values, scope trace)    |
| `#888`      | `--text-muted`      | muted control labels / button text                |
| `#666`      | `--text-dim`        | dim hints / units                                 |
| `#555`      | `--text-faint`      | faintest grey (shell label, MIDI dots, hover ring)|
| `#111111`   | `--surface-deep`    | body bg + LevelLed off-state                      |
| `#1c1c1c`   | `--surface-base`    | panel / inset / scope backgrounds                 |
| `#2a2a2a`   | `--surface-raised`  | control/button background, knob body fill         |
| `#333`      | `--border`          | panel borders, knob track arc, keyboard rail      |
| `#444`      | `--border-strong`   | control borders, knob track stroke                |
| `#20b040`   | `--led-on`          | active green (6 panels + PowerButton)             |
| `#c8413a`   | `--danger`          | red clip/danger (PatchControl)                    |
| mono stack  | `--font-mono`       | `'JetBrains Mono', …, monospace` (global.css)     |

12 color tokens + 1 font token. Component-layer tokens cascade from these; a few
one-off shades hold their own literal in the component layer (see `theme.css`):
`#3a2a1a` (`--accent-active-bg`), `#4a3424` (`--accent-active-hover-bg`),
`#1a2a1a` (`--led-on-bg`), `#6a6a6a` (`--knob-tick-color`), `#5ccc5c`
(`--midi-connected-color`), `#e07820`/`#e0c020` (`--power-glow-warn`/`-ready`),
`#dddddd`/`#1a1a1a`/`#000`/`#aaa` (keyboard key fills/strokes/labels).

## Per-occurrence decisions for non-hex / edge cases

- **`rgba(0, 0, 0, 0.5)` shadows** — `WheelsPanel.svelte:247` and
  `PatchControl.svelte:427`, both `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5)` on a
  dropdown. Identical generic black depth cue, not an identity color → **left
  structural** (per D6; matches the spec's structural-CSS exception).
- **`LevelLed` `hsl(h, 100%, 50%)` ramp** — algorithmic, runtime-driven via
  `style:--led-color`; **out of scope** (D7). Only its `#111111` off-state is
  tokenized → `--led-off-color` (cascades from `--surface-deep`).
- **`Volume.svelte`** — panel-shaped (`#1c1c1c` bg, `#333` border, `#e8dcc8`
  label). Classified as an **instrument panel** → tokenized in task **4.1**
  (matches the task lists; chassis list 3.1 excludes it).
- **Fonts (D7)** — global mono stack → `--font-mono`; `font-family: inherit`
  sites left as-is (cascade from the tokenized global rule); bare
  `font-family: monospace` sites left as-is (NOT folded into `--font-mono`).

## Exact-match test assertions (human-approved deviation)

Three chassis identity literals are asserted by exact-match (serialization)
tests, so tokenizing them changes those assertions — a documented deviation from
tasks 3.2/4.2's "no assertion changes" note, approved by the human. Rendered
pixels are unchanged (the D5 screenshot gate proves it); only the asserted
serialization string changes:

- `Scope.svelte:123` inline `background: #1c1c1c` → `var(--panel-bg, #1c1c1c)`;
  `Scope.test.js:42` assertion updated to the tokenized form.
- `Scope.svelte:26,47` canvas `context.strokeStyle = '#e8dcc8'` → read from the
  `--scope-trace-color` custom property with a `#e8dcc8` fallback (tests assert
  only that `stroke()` is called, not the color — no test change needed).
- `Keyboard.svelte:137` rail `fill="#333"` → `fill="var(--panel-border, #333)"`;
  `Keyboard.test.js:40` selector updated to the tokenized form.
