# Scope Focus

When you work on a large repo, most of the time you only need to focus on a subset of files. This extension enables you to switch between predefined subsets (called "scopes") and hide rest files. It aims to provide a similar experience to IntelliJ's [scopes](https://www.jetbrains.com/help/idea/settings-scopes.html).

You can consider it as a workaround of [vscode#869](https://github.com/microsoft/vscode/issues/869).

## Features

- Create scopes.
- Switch between them.

## Extension Settings

These settings should go to workspace-level, i.e., `.vscode/settings.json`.

- `scope-focus.activeScope`: Switch active scope. You can operate this on status bar as well.
- `scope-focus.scopes`: Define scopes. Hover on settings to see details.

Taking [llvm-project](https://github.com/llvm/llvm-project) as an example. If you want to focus on `clang` and `llvm` and exclude `cmake` sub-folders, you can configure like this:

```json
{
    "scope-focus.activeScope": "Clang",
    "scope-focus.scopes": {
        "Clang": {
            "include": ["clang", "llvm"],
            "exclude": ["*/cmake"]
        }
    }
}
```

## Known Issues

This extension works by changing the workspace-level `files.exclude` setting. Yours will be overwritten.

## Alternatives

- [Project Scopes](https://marketplace.visualstudio.com/items?itemName=cfcluan.project-scopes)
- [Folder Scopes](https://marketplace.visualstudio.com/items?itemName=bartosz-dude.folder-scopes)

## Release Notes

### 0.1.0

TODO
