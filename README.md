# Scope Focus

When you work on a large repo, most of the time you only need to focus on a subset of files. This extension enables you to switch between predefined subsets (called "scopes") and hide rest files. It aims to provide a similar experience to IntelliJ's [scopes](https://www.jetbrains.com/help/idea/settings-scopes.html).

You can consider it as a workaround of [vscode#869](https://github.com/microsoft/vscode/issues/869).

## Features

TODO

## Extension Settings

- `scope-focus.activeScope`: Switch active scope. You can do this on status bar as well.
- `scope-focus.scopes`: Define scopes. Hover on settings to see detailed descriptions.

## Known Issues

This extension works by changing the workspace-level `files.exclude` setting. Yours will be overwritten.

## Alternatives

- [Project Scopes](https://marketplace.visualstudio.com/items?itemName=cfcluan.project-scopes)
- [Folder Scopes](https://marketplace.visualstudio.com/items?itemName=bartosz-dude.folder-scopes)

## Release Notes

### 0.1.0

TODO
