# Scope Focus

When working on a large repo, it's often desired to focus on a subset of files. This extension lets you switch among predefined subsets (called "scopes") and hide rest files. It aims to provide a similar experience to IntelliJ's [scopes](https://www.jetbrains.com/help/idea/settings-scopes.html).

You can consider it as a workaround of [vscode#869](https://github.com/microsoft/vscode/issues/869).

## Features

- Create scopes.
- Switch among them.

## Extension Settings

- `scope-focus.scopes`: Define scopes. Hover on settings to see details.

Taking [llvm-project](https://github.com/llvm/llvm-project) as an example. If you want to focus on `clang` and `llvm` and then exclude `cmake` sub-folders, you can configure like this:

```json
{
    "scope-focus.scopes": {
        "LLVM/Clang": {
            "include": ["clang", "llvm"],  // accept globs
            "exclude": ["*/cmake"]         // accept globs
        }
    }
}
```

After defining scopes, you will see a status bar item with text `No Scope`. Click it to change active scope.

## Known Issues

- This extension works by changing the workspace-level `files.exclude` setting. Yours will be overwritten.
- Currently it doesn't support [multi-root workspaces](https://code.visualstudio.com/docs/editor/multi-root-workspaces). File an issue if you need this feature.

## Alternatives

- [Project Scopes](https://marketplace.visualstudio.com/items?itemName=cfcluan.project-scopes)
- [Folder Scopes](https://marketplace.visualstudio.com/items?itemName=bartosz-dude.folder-scopes)

## Release Notes

### 0.1.1

Avoid creating `.vscode/settings.json`.

### 0.1.0

Basic implementation.
