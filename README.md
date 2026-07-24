# AeroCraft & Bear — VS Code / Cursor extension

ForgeStack editor helpers: filtered **AeroCraft** class completions (dropdown with color chips in the details pane), **Bear** JSX **prop** completions on tags like `Flex` / `Button`, hovers on utilities and components, plus Bear snippets for React.

Pinned to **`@forgedevstack/aerocraft@^1.0.6`**. Completions include ring / divide / content utilities and the unified default palette. When an `aerocraft.config.*` file is present in the workspace, suggestions use that config’s `prefix` and `separator`.

### Suggest widget vs inline AI

Cursor and Copilot can show **inline ghost text** that hides the normal IntelliSense list. To see the **dropdown** with AeroCraft options, use **Trigger Suggest** (default **Ctrl+Space** on Windows/Linux; on macOS VS Code often uses **Ctrl+Space** as well — check *Keyboard Shortcuts* for `editor.action.triggerSuggest`). You can also try **Editor: Quick Suggestions** settings if the list never appears.

## Develop

```bash
cd aero-craft-plugin
npm install
```

`postinstall` runs the TypeScript build into `out/`. Reload the editor window (or use **Developer: Reload Window**) after install. Open this folder in VS Code / Cursor and use **Run Extension** from the debug panel when hacking on the extension.

## Package

```bash
npm install -g @vscode/vsce
npm install
vsce package
```

Install the `.vsix` via **Extensions: Install from VSIX**.

## Settings

| Key | Default | Purpose |
|-----|---------|---------|
| `aerocraft.enableCompletions` | `true` | Toggle shortcut suggestions |
| `aerocraft.utilityAliasMode` | `false` | Add multi-class alias suggestions for mixed codebases |
| `bear.enableComponentSnippets` | `true` | Enable `snippets/bear.json` in TSX |

## Roadmap

- More Bear components in `bearProps.ts`
- Marketplace publish

MIT — ForgeStack
